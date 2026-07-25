const Complaint = require("../models/Complaint");
const mongoose = require("mongoose");
const IncidentCommand = require("../models/IncidentCommand");
const User = require("../models/User");
const AuthorityTicket = require("../models/AuthorityTicket");
const CommunityVerificationEvent = require("../models/CommunityVerificationEvent");
const IncidentCluster = require("../models/IncidentCluster");
const crypto = require("crypto");
const { transcribeAudio, compareResolutionEvidence } = require("../services/aiClient");
const { analyzeImagePreview, summarizeImageAnalysis, createComplaintFromPayload, createHttpError } = require("../services/complaintService");
const { buildFollowUpSchedule, refreshComplaintFollowUp } = require("../services/followUpService");
const { buildComplaintIntelligence } = require("../services/civicIntelligenceService");
const { areaMatchesLocation } = require("../utils/localAlerts");
const {
  normalizeSignal,
  eligibleSavedArea,
  applyCommunityVerification,
  publicCommunityVerification,
  summarizeCommunityVerification
} = require("../services/communityVerificationService");
const { applyHumanReview, getReviewOptions, normalizeReviewPayload } = require("../services/humanReviewService");
const { appendDecisionEvent, decisionSnapshot, recordAiBaseline, verifyDecisionAudit } = require("../services/decisionAuditService");
const { assertOperationalCityAccess, canAccessComplaint, ownsComplaint } = require("../services/operationalAccessService");

const ALLOWED_STATUSES = ["Queued", "Needs Review", "In Progress", "Resolved", "Escalated"];
const ALLOWED_VERIFICATION_VOTES = new Set(["still_there", "resolved", "got_worse"]);
const MAX_VERIFICATION_NOTE_LENGTH = 280;
const MAX_RESOLUTION_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_RESOLUTION_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const ALLOWED_AUDIO_MIME_TYPES = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/x-wav"
]);

function commandStatusForComplaintStatus(status) {
  if (status === "Resolved") return "Resolved";
  if (status === "Escalated") return "Active";
  if (status === "In Progress") return "Active";
  return "Monitoring";
}

function summarizeVerification(votes = []) {
  const summary = {
    stillThere: 0,
    resolved: 0,
    gotWorse: 0,
    total: votes.length,
    citizenStatus: "unverified",
    lastVoteAt: null
  };

  votes.forEach((vote) => {
    if (vote.vote === "still_there") summary.stillThere += 1;
    if (vote.vote === "resolved") summary.resolved += 1;
    if (vote.vote === "got_worse") summary.gotWorse += 1;
    if (vote.createdAt && (!summary.lastVoteAt || new Date(vote.createdAt) > new Date(summary.lastVoteAt))) {
      summary.lastVoteAt = vote.createdAt;
    }
  });

  if (summary.gotWorse > 0 && summary.gotWorse >= summary.resolved) {
    summary.citizenStatus = "getting_worse";
  } else if (summary.stillThere > summary.resolved) {
    summary.citizenStatus = "still_reported";
  } else if (summary.resolved > 0) {
    summary.citizenStatus = "citizen_confirmed_resolved";
  }

  return summary;
}

function normalizeResolutionImage(payload) {
  const imageBase64 = String(payload.imageBase64 || "").trim();
  const imageMimeType = String(payload.imageMimeType || "").trim().toLowerCase();
  if (!imageBase64) return { imageBase64: "", imageMimeType: "" };
  if (!ALLOWED_RESOLUTION_IMAGE_MIME_TYPES.has(imageMimeType)) {
    throw createHttpError("Follow-up photo must be a JPEG, PNG, or WebP image.", 400);
  }
  if (!/^[A-Za-z0-9+/=]+$/.test(imageBase64)) {
    throw createHttpError("Follow-up image payload is invalid.", 400);
  }
  if (Math.floor((imageBase64.length * 3) / 4) > MAX_RESOLUTION_IMAGE_BYTES) {
    throw createHttpError("Follow-up photo is too large. Upload an image smaller than 2 MB.", 413);
  }
  return { imageBase64, imageMimeType };
}

async function analyzeAndCreateComplaint(req, res, next) {
  try {
    console.info(JSON.stringify({
      event: "complaint_analysis_started",
      requestId: req.requestId,
      operation: "submit",
      hasImage: Boolean(req.body?.imageBase64)
    }));
    const { analysis, complaint } = await createComplaintFromPayload(req.auth, req.body, {
      requestId: req.requestId
    });

    res.json({
      nlp: analysis.nlp,
      cv: analysis.cv,
      imageAnalysis: summarizeImageAnalysis(analysis),
      imageUpload: analysis.imageUpload,
      priority: analysis.priority,
      confidence: analysis.confidence,
      status: analysis.status,
      assignedAuthority: analysis.assignedAuthority,
      routing: analysis.routing,
      broadcast: analysis.broadcast,
      incidentCommand: analysis.incidentCommand,
      incidentCluster: analysis.incidentCluster || complaint.incidentCluster,
      followUp: complaint.followUp,
      verification: complaint.verification,
      communityVerification: publicCommunityVerification(complaint.communityProof, req.auth, complaint._id),
      communityProof: publicCommunityVerification(complaint.communityProof, req.auth, complaint._id),
      decisionAudit: complaint.decisionAudit,
      mapLocation: analysis.mapLocation,
      areaIntelligence: analysis.areaIntelligence,
      weather: analysis.weather,
      civicEvidence: analysis.civicEvidence,
      threatAssessment: analysis.threatAssessment || analysis.explainability?.threatAssessment || analysis.cv?.threatAssessment || null,
      explainability: analysis.explainability,
      aiMeta: analysis.aiMeta,
      alerts: analysis.alerts,
      notifications: analysis.notifications,
      auth: {
        role: req.auth.role,
        permissions: req.auth.permissions
      },
      complaintId: complaint._id
    });
  } catch (error) {
    error.failureStage = error.failureStage || "complaint_submission";
    console.warn(JSON.stringify({
      event: "complaint_analysis_failed",
      requestId: req.requestId,
      operation: "submit",
      failureStage: error.failureStage,
      statusCode: Number(error.statusCode) || 500,
      errorType: error.name || "Error"
    }));
    next(error);
  }
}

async function previewComplaintImage(req, res, next) {
  try {
    console.info(JSON.stringify({
      event: "complaint_analysis_started",
      requestId: req.requestId,
      operation: "image_preview",
      hasImage: Boolean(req.body?.imageBase64)
    }));
    const analysis = await analyzeImagePreview(req.body, { requestId: req.requestId });
    const imageAnalysis = summarizeImageAnalysis(analysis);
    console.info(JSON.stringify({
      event: "complaint_analysis_completed",
      requestId: req.requestId,
      operation: "image_preview",
      status: imageAnalysis.status,
      provider: imageAnalysis.provider,
      fallbackUsed: imageAnalysis.fallbackUsed,
      failureStage: imageAnalysis.failureStage
    }));
    res.json({
      imageAnalysis,
      cv: analysis.cv,
      decision: analysis.decision,
      confidence: analysis.confidence,
      confidenceLabel: analysis.confidenceLabel,
      reviewRequired: Boolean(analysis.reviewRequired || analysis.decision?.reviewRequired),
      threatAssessment: analysis.threatAssessment || analysis.cv?.threatAssessment || null,
      aiMeta: analysis.aiMeta,
      diagnostics: {
        requestId: req.requestId,
        stage: imageAnalysis.failureStage || "completed",
        upstreamStatus: imageAnalysis.upstreamStatus || "ok"
      }
    });
  } catch (error) {
    error.failureStage = error.failureStage || "image_preview";
    console.warn(JSON.stringify({
      event: "complaint_analysis_failed",
      requestId: req.requestId,
      operation: "image_preview",
      failureStage: error.failureStage,
      statusCode: Number(error.statusCode) || 500,
      errorType: error.name || "Error"
    }));
    next(error);
  }
}

async function getComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id).lean();
    if (!complaint) {
      throw createHttpError("Complaint not found", 404);
    }

    if (!canAccessComplaint(req.auth, complaint)) {
      throw createHttpError("Permission denied", 403);
    }

    const communitySignals = complaint.communityProof?.signals || [];
    complaint.communityProof = {
      summary: summarizeCommunityVerification(communitySignals, complaint)
    };

    const canReview = req.auth.permissions.includes("update_complaint_status");
    const decisionAudit = canReview
      ? await verifyDecisionAudit(complaint._id, { complaint })
      : null;
    const authorityTicket = canReview ? await AuthorityTicket.findOne({ complaintId: complaint._id }).lean() : null;

    res.json({
      complaint,
      intelligence: buildComplaintIntelligence(complaint),
      reviewOptions: canReview ? getReviewOptions(complaint.cityId) : null,
      decisionAudit,
      authorityTicket
    });
  } catch (error) {
    next(error);
  }
}

async function transcribeComplaintAudio(req, res, next) {
  try {
    const audioBase64 = String(req.body.audioBase64 || "").trim();
    const filename = String(req.body.filename || "complaint-audio").trim();
    const mimeType = String(req.body.mimeType || "application/octet-stream").trim();
    const normalizedMimeType = mimeType.toLowerCase().split(";")[0].trim();

    if (!audioBase64) {
      throw createHttpError("Upload an audio file before requesting transcription.", 400);
    }
    if (!/^[A-Za-z0-9+/=]+$/.test(audioBase64)) {
      throw createHttpError("Audio payload is invalid.", 400);
    }
    if (!ALLOWED_AUDIO_MIME_TYPES.has(normalizedMimeType)) {
      throw createHttpError("Unsupported audio type. Record or upload WebM, MP4, MP3, WAV, or OGG audio.", 400);
    }
    const estimatedBytes = Math.floor((audioBase64.length * 3) / 4);
    if (estimatedBytes > MAX_AUDIO_BYTES) {
      throw createHttpError("Audio recording is too large. Try a shorter recording.", 413);
    }

    const transcription = await transcribeAudio({
      audioBase64,
      filename,
      mimeType: normalizedMimeType
    });

    res.json({
      transcript: String(transcription.transcript || "").trim(),
      language: transcription.language || "unknown"
    });
  } catch (error) {
    next(error);
  }
}

async function updateComplaintStatus(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      const error = new Error("Complaint not found");
      error.statusCode = 404;
      throw error;
    }
    assertOperationalCityAccess(req.auth, complaint);

    let statusOrPriorityChanged = false;

    if (req.body.status) {
      if (!ALLOWED_STATUSES.includes(req.body.status)) {
        throw createHttpError("Invalid complaint status.", 400);
      }
      complaint.status = req.body.status;
      statusOrPriorityChanged = true;
      complaint.statusHistory = [
        ...(complaint.statusHistory || []),
        {
          status: req.body.status,
          changedBy: req.auth.username,
          changedAt: new Date(),
          note: String(req.body.alertNote || req.body.note || "").trim()
        }
      ];

      if (req.body.status === "Resolved") {
        const existingResolution = complaint.resolution?.toObject ? complaint.resolution.toObject() : (complaint.resolution || {});
        const verificationRequest = "Authority marked this complaint resolved. Please confirm the outcome or report that the issue remains.";
        complaint.resolution = {
          ...existingResolution,
          phase: "awaiting_citizen_verification",
          authorityUpdate: {
            markedBy: req.auth.username,
            markedAt: new Date(),
            note: String(req.body.alertNote || req.body.note || "").trim()
          }
        };
        if (!(complaint.alerts || []).includes(verificationRequest)) {
          complaint.alerts = [...(complaint.alerts || []), verificationRequest];
        }
      } else if (complaint.resolution?.phase === "awaiting_citizen_verification") {
        complaint.resolution.phase = "not_requested";
      }

      if (complaint.incidentCommand?.triggered && complaint.incidentCommand?.incidentId) {
        const commandStatus = commandStatusForComplaintStatus(req.body.status);
        await IncidentCommand.findByIdAndUpdate(complaint.incidentCommand.incidentId, {
          commandStatus,
          $push: {
            timeline: {
              event: `Complaint status changed to ${req.body.status}`,
              at: new Date(),
              by: req.auth.username
            }
          }
        });
        complaint.incidentCommand.status = commandStatus;
      }
    }

    if (req.body.priority !== undefined) {
      throw createHttpError("Severity corrections require the human-review workflow and reviewer reasoning.", 400);
    }
    if (statusOrPriorityChanged) {
      complaint.followUp = {
        ...(complaint.followUp || {}),
        ...buildFollowUpSchedule(complaint, new Date())
      };
      refreshComplaintFollowUp(complaint);
    }
    if (req.body.alertNote) {
      complaint.alerts = [...complaint.alerts, req.body.alertNote];
    }

    await complaint.save();

    res.json({
      message: "Complaint status updated successfully.",
      complaint
    });
  } catch (error) {
    next(error);
  }
}

async function acknowledgeAlert(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      const error = new Error("Complaint not found");
      error.statusCode = 404;
      throw error;
    }
    assertOperationalCityAccess(req.auth, complaint);

    const note = `Alert acknowledged by ${req.auth.username}`;
    if (!complaint.alerts.includes(note)) {
      complaint.alerts = [...complaint.alerts, note];
      await complaint.save();
    }

    res.json({
      message: "Alert acknowledged successfully.",
      complaint
    });
  } catch (error) {
    next(error);
  }
}

async function verifyComplaintStatus(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      throw createHttpError("Complaint not found", 404);
    }
    if (!ownsComplaint(req.auth, complaint)) {
      throw createHttpError("Permission denied", 403);
    }

    const vote = String(req.body.vote || "").trim();
    const note = String(req.body.note || "").replace(/\s+/g, " ").trim();
    if (!ALLOWED_VERIFICATION_VOTES.has(vote)) {
      throw createHttpError("Choose a valid verification vote.", 400);
    }
    if (note.length > MAX_VERIFICATION_NOTE_LENGTH) {
      throw createHttpError(`Verification note must be ${MAX_VERIFICATION_NOTE_LENGTH} characters or fewer.`, 400);
    }

    complaint.verification = complaint.verification || {
      summary: summarizeVerification([]),
      votes: []
    };
    const userKey = String(req.auth.userId || req.auth.username || "").trim();
    const existingIndex = (complaint.verification?.votes || []).findIndex((entry) =>
      String(entry.userId || entry.username || "") === userKey
    );
    const voteRecord = {
      userId: String(req.auth.userId || ""),
      username: req.auth.username || "",
      vote,
      note,
      createdAt: new Date()
    };

    if (existingIndex >= 0) {
      complaint.verification.votes[existingIndex] = voteRecord;
    } else {
      complaint.verification.votes = [...(complaint.verification?.votes || []), voteRecord];
    }

    complaint.verification.summary = summarizeVerification(complaint.verification.votes);
    const readableVote = vote.replace(/_/g, " ");
    const auditNote = `Citizen verification: ${readableVote}${note ? ` - ${note}` : ""}`;
    complaint.statusHistory = [
      ...(complaint.statusHistory || []),
      {
        status: complaint.status,
        changedBy: req.auth.username || "citizen",
        changedAt: new Date(),
        note: auditNote
      }
    ];

    if (vote === "got_worse") {
      complaint.alerts = [...(complaint.alerts || []), auditNote];
      if (complaint.status !== "Resolved") {
        complaint.followUp = {
          ...(complaint.followUp || {}),
          status: "overdue",
          escalationNote: "Citizen verification says the issue got worse."
        };
      }
    }

    await complaint.save();

    res.json({
      message: "Citizen verification recorded.",
      verification: complaint.verification
    });
  } catch (error) {
    next(error);
  }
}

async function submitResolutionEvidence(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      throw createHttpError("Complaint not found", 404);
    }
    if (!ownsComplaint(req.auth, complaint)) {
      throw createHttpError("Permission denied", 403);
    }

    const vote = String(req.body.vote || "").trim();
    const note = String(req.body.note || "").replace(/\s+/g, " ").trim();
    if (!ALLOWED_VERIFICATION_VOTES.has(vote)) {
      throw createHttpError("Choose a valid resolution verification response.", 400);
    }
    if (note.length > MAX_VERIFICATION_NOTE_LENGTH) {
      throw createHttpError(`Resolution note must be ${MAX_VERIFICATION_NOTE_LENGTH} characters or fewer.`, 400);
    }

    const imagePayload = normalizeResolutionImage(req.body);
    const comparison = await compareResolutionEvidence({
      originalCategoryId: complaint.ai?.categoryId || "general",
      originalType: complaint.type,
      originalPriority: complaint.priority,
      location: complaint.location,
      vote,
      note,
      imageFeatures: req.body.imageFeatures || null,
      ...imagePayload
    });
    const phase = comparison.outcome || "needs_admin_review";
    const evidenceRecord = {
      userId: String(req.auth.userId || ""),
      username: req.auth.username || "citizen",
      vote,
      note,
      imageProvided: Boolean(imagePayload.imageBase64 || req.body.imageFeatures),
      imageFingerprint: String(comparison.followUpEvidence?.imageFingerprint || ""),
      submittedAt: new Date()
    };

    const existingResolution = complaint.resolution?.toObject ? complaint.resolution.toObject() : (complaint.resolution || {});
    complaint.resolution = {
      ...existingResolution,
      phase,
      citizenEvidence: [...(complaint.resolution?.citizenEvidence || []), evidenceRecord].slice(-12),
      aiAssessment: {
        outcome: phase,
        confidence: Number(comparison.confidence || 0),
        reason: String(comparison.reason || "Resolution evidence requires review."),
        visualComparison: String(comparison.visualComparison || "not_available"),
        engine: String(comparison.engine || "resolution-evidence-comparator-v1"),
        assessedAt: new Date(),
        disclaimer: String(comparison.disclaimer || "")
      }
    };

    const outcomeNote = `Resolution review: ${phase.replace(/_/g, " ")} - ${comparison.reason || "Follow-up recorded."}`;
    let reopenedStatus = "";
    if (phase === "needs_rework") {
      reopenedStatus = complaint.priority === "Critical" ? "Escalated" : "In Progress";
      complaint.status = reopenedStatus;
      complaint.followUp = {
        ...(complaint.followUp || {}),
        status: "overdue",
        escalationNote: "Citizen resolution evidence indicates the issue remains or worsened."
      };
      complaint.alerts = [...(complaint.alerts || []), outcomeNote];
    }
    if (phase === "needs_admin_review") {
      complaint.followUp = {
        ...(complaint.followUp || {}),
        status: "due",
        escalationNote: "Resolution evidence needs an authority review."
      };
    }

    complaint.statusHistory = [
      ...(complaint.statusHistory || []),
      { status: complaint.status, changedBy: req.auth.username || "citizen", changedAt: new Date(), note: outcomeNote }
    ];
    if (reopenedStatus && complaint.incidentCommand?.triggered && complaint.incidentCommand?.incidentId) {
      const commandStatus = commandStatusForComplaintStatus(reopenedStatus);
      await IncidentCommand.findByIdAndUpdate(complaint.incidentCommand.incidentId, {
        commandStatus,
        $push: {
          timeline: {
            event: `Resolution evidence reopened complaint as ${reopenedStatus}`,
            at: new Date(),
            by: req.auth.username || "citizen"
          }
        }
      });
      complaint.incidentCommand.status = commandStatus;
    }

    await complaint.save();
    res.json({ message: "Resolution evidence recorded.", resolution: complaint.resolution, complaint });
  } catch (error) {
    next(error);
  }
}

async function submitCommunityProof(req, res, next) {
  try {
    const complaintQuery = Complaint.findById(req.params.id);
    const complaint = typeof complaintQuery?.select === "function"
      ? await complaintQuery.select("+communityProof.signals.actorHash +communityProof.signals.areaKeyHash")
      : await complaintQuery;
    if (!complaint) throw createHttpError("Complaint not found", 404);
    if (req.auth.role !== "Citizen") {
      throw createHttpError("Community verification is available to nearby citizens only.", 403);
    }
    if (ownsComplaint(req.auth, complaint)) {
      throw createHttpError("Reporters cannot verify their own complaint. Use the complaint follow-up flow instead.", 403);
    }
    if (complaint.status === "Resolved") {
      throw createHttpError("This incident is already resolved. Use the resolution confirmation flow instead.", 400);
    }

    const signal = normalizeSignal(req.body.signal);
    const note = String(req.body.note || "").replace(/\s+/g, " ").trim();
    if (!signal) throw createHttpError("Choose a valid community verification status.", 400);
    if (note.length > MAX_VERIFICATION_NOTE_LENGTH) throw createHttpError(`Community note must be ${MAX_VERIFICATION_NOTE_LENGTH} characters or fewer.`, 400);

    const user = await User.findById(req.auth.userId, { localAlertPreferences: 1 }).lean();
    const preferences = user?.localAlertPreferences || {};
    if (!eligibleSavedArea(preferences, complaint)) {
      throw createHttpError("Community verification is available only for incidents in your saved local-alert areas.", 403);
    }

    let duplicateComplaintId = null;
    if (signal === "duplicate") {
      const candidateId = String(req.body.duplicateComplaintId || "").trim();
      if (!mongoose.isValidObjectId(candidateId) || candidateId === String(complaint._id)) {
        throw createHttpError("Choose a different valid complaint as the possible duplicate.", 400);
      }
      const candidate = await Complaint.findById(candidateId, { location: 1, type: 1, "ai.categoryId": 1, "routing.wardCode": 1 }).lean();
      if (!candidate) throw createHttpError("The possible duplicate complaint was not found.", 404);
      const sameCategory = String(candidate.ai?.categoryId || candidate.type) === String(complaint.ai?.categoryId || complaint.type);
      const sameArea = candidate.routing?.wardCode && candidate.routing.wardCode === complaint.routing?.wardCode
        ? true
        : areaMatchesLocation(candidate.location, [complaint.location, complaint.areaIntelligence?.likelyArea].filter(Boolean));
      if (!sameCategory || !sameArea) {
        throw createHttpError("A duplicate must describe the same issue category in the same affected area.", 400);
      }
      duplicateComplaintId = candidate._id;
    }

    const result = applyCommunityVerification({
      signals: (complaint.communityProof?.signals || []).map((entry) => entry.toObject ? entry.toObject({ depopulate: true }) : entry),
      auth: { ...req.auth, preferences },
      complaint,
      signal,
      note,
      duplicateComplaintId
    });
    complaint.communityProof = { summary: result.summary, signals: result.signals };
    const audit = `Community verification: ${signal.replace(/_/g, " ")}`;
    if (result.outcome !== "idempotent") {
      complaint.statusHistory = [...(complaint.statusHistory || []), { status: complaint.status, changedBy: "community-verification", changedAt: new Date(), note: audit }];
      if (signal === "worsening" || result.summary.communityWide) complaint.alerts = [...(complaint.alerts || []), audit];
    }
    await complaint.save();

    if (complaint.incidentCluster?.clusterId) {
      await IncidentCluster.findByIdAndUpdate(complaint.incidentCluster.clusterId, {
        communityStatus: result.summary.latestStatus,
        communityVerificationCount: result.summary.trustedTotal,
        communityWide: result.summary.communityWide,
        lastCommunityVerifiedAt: result.summary.lastVerifiedAt
      }).catch((error) => console.error("Community cluster update failed:", error.message));
    }
    await CommunityVerificationEvent.create({
      eventId: crypto.randomUUID(),
      complaintId: complaint._id,
      actorHash: result.actorHash,
      areaKeyHash: result.areaKeyHash || result.signals.find((entry) => entry.actorHash === result.actorHash)?.areaKeyHash,
      signal,
      priorSignal: result.priorSignal,
      duplicateComplaintId,
      outcome: result.outcome,
      requestId: String(req.headers?.["x-request-id"] || "").slice(0, 120),
      summary: result.summary
    }).catch((error) => console.error("Community verification audit write failed:", error.message));

    res.json({
      message: result.outcome === "idempotent" ? "This community status was already recorded." : "Community verification recorded.",
      communityVerification: publicCommunityVerification(complaint.communityProof, req.auth, complaint._id),
      communityProof: publicCommunityVerification(complaint.communityProof, req.auth, complaint._id)
    });
  } catch (error) {
    next(error);
  }
}

async function submitHumanReview(req, res, next) {
  try {
    const execute = async (session = null) => {
      let query = Complaint.findById(req.params.id);
      if (session && typeof query.session === "function") query = query.session(session);
      const complaint = await query;
      if (!complaint) throw createHttpError("Complaint not found", 404);
      assertOperationalCityAccess(req.auth, complaint);

      const review = normalizeReviewPayload(req.body, complaint);
      if (Number(complaint.__v || 0) !== review.expectedVersion) {
        throw createHttpError("This complaint changed after you opened it. Refresh the case before submitting your review.", 409);
      }

      const before = decisionSnapshot(complaint);
      if (session && !Number(complaint.decisionAudit?.eventCount || 0)) {
        await recordAiBaseline(complaint, { session });
      }
      const humanReview = applyHumanReview(complaint, review, req.auth);
      if (complaint.incidentCommand?.triggered && complaint.incidentCommand?.incidentId) {
        const commandStatus = commandStatusForComplaintStatus(complaint.status);
        await IncidentCommand.findByIdAndUpdate(complaint.incidentCommand.incidentId, {
          severity: complaint.priority,
          title: `${complaint.priority} ${complaint.type}`,
          assignedAuthority: complaint.routing?.authority || complaint.assignedAuthority,
          assignedDepartment: complaint.routing?.department || "",
          assignedUnit: complaint.routing?.unit || "",
          commandStatus,
          $push: {
            timeline: {
              event: `Human review ${review.outcome.replace(/_/g, " ")} applied`,
              at: humanReview.reviewedAt,
              by: "authorized-human-review"
            }
          }
        }, session ? { session } : undefined);
        complaint.incidentCommand.severity = complaint.priority;
        complaint.incidentCommand.assignedUnit = complaint.routing?.unit || complaint.incidentCommand.assignedUnit;
        complaint.incidentCommand.status = commandStatus;
      }

      if (session) {
        await appendDecisionEvent({
          complaint,
          eventType: "human_review",
          outcome: review.outcome,
          actorType: "human",
          actorRole: req.auth.role || "Admin",
          before,
          after: decisionSnapshot(complaint),
          changedFields: review.changedFields || [],
          reason: review.reason,
          occurredAt: humanReview.reviewedAt,
          session
        });
      }
      await complaint.save(session ? { session } : undefined);
      return { complaint, review, humanReview };
    };

    const result = mongoose.connection.readyState === 1
      ? await mongoose.connection.transaction((session) => execute(session))
      : await execute();
    const { complaint, review, humanReview } = result;
    res.json({
      message:
        review.outcome === "confirmed"
          ? "AI decision confirmed by human review."
          : review.outcome === "corrected"
            ? "Human correction applied to the complaint."
            : "Complaint marked as needing better evidence.",
      complaint,
      humanReview
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  previewComplaintImage,
  analyzeAndCreateComplaint,
  getComplaint,
  transcribeComplaintAudio,
  updateComplaintStatus,
  acknowledgeAlert,
  verifyComplaintStatus,
  submitResolutionEvidence,
  submitCommunityProof,
  submitHumanReview
};
