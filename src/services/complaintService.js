const Complaint = require("../models/Complaint");
const mongoose = require("mongoose");
const { analyzeComplaint } = require("./aiClient");
const { createEmergencyBroadcast } = require("./broadcastService");
const { createIncidentCommand, summarizeIncidentCommand } = require("./incidentCommandService");
const { attachComplaintToCluster } = require("./incidentClusterService");
const { initializeFollowUp } = require("./followUpService");
const { canonicalPriority, routeComplaint } = require("./routingService");
const { buildWeatherImpactNote, unavailableWeather } = require("./weatherService");
const { recordAiBaseline } = require("./decisionAuditService");
const { readDraftContext } = require("./draftContextService");
const { extractAreaIntelligence } = require("../utils/localAlerts");
const BENGALURU = require("../config/bengaluru");

const LOW_CONFIDENCE_THRESHOLD = 0.52;
const GEOCODE_TIMEOUT_MS = 3500;
const MAX_AI_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_LOCATION_LENGTH = 240;
const MAX_COMPLAINT_TEXT_LENGTH = 2500;
const MAX_IMAGE_HINT_LENGTH = 800;
const MAX_VOICE_TRANSCRIPT_LENGTH = 3500;
const ALLOWED_AI_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PRIORITY_ORDER = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4
};

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildFallbackMapLocation(location, center = { lat: 12.9716, lng: 77.5946 }) {
  const baseLat = Number(center.lat) || 12.9716;
  const baseLng = Number(center.lng) || 77.5946;
  const seed = Array.from(String(location || "unknown")).reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return {
    lat: Number((baseLat + ((seed % 35) - 17) / 1000).toFixed(6)),
    lng: Number((baseLng + ((Math.floor(seed / 7) % 35) - 17) / 1000).toFixed(6)),
    source: "fallback"
  };
}

function normalizeImagePayload(payload) {
  const imageBase64 = String(payload.imageBase64 || "").trim();
  const imageMimeType = String(payload.imageMimeType || "").trim().toLowerCase();

  if (!imageBase64) {
    return {
      imageBase64: "",
      imageMimeType: ""
    };
  }

  if (!ALLOWED_AI_IMAGE_MIME_TYPES.has(imageMimeType)) {
    throw createHttpError("Unsupported image type. Upload a JPEG, PNG, or WebP image.", 400);
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(imageBase64)) {
    throw createHttpError("Image payload is invalid.", 400);
  }

  const estimatedBytes = Math.floor((imageBase64.length * 3) / 4);
  if (estimatedBytes > MAX_AI_IMAGE_BYTES) {
    throw createHttpError("Image is too large for AI analysis. Upload a smaller image.", 413);
  }

  return {
    imageBase64,
    imageMimeType
  };
}

function normalizeLimitedText(value, fieldName, maxLength) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (normalized.length > maxLength) {
    throw createHttpError(`${fieldName} is too long. Keep it under ${maxLength} characters.`, 413);
  }

  return normalized;
}

async function geocodeLocation(location, center) {
  const query = String(location || "").trim();
  if (!query) {
    return buildFallbackMapLocation(query, center);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", query);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Urban-Pulse-Ai/1.0 civic-complaint-geocoder"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error("Geocoding service unavailable.");
    }

    const results = await response.json();
    const first = Array.isArray(results) ? results[0] : null;
    const lat = Number(first?.lat);
    const lng = Number(first?.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error("No geocoding result found.");
    }

    return {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      source: "nominatim"
    };
  } catch (_error) {
    return buildFallbackMapLocation(query, center);
  } finally {
    clearTimeout(timeout);
  }
}

function isWithinCityEnvelope(city, mapLocation, margin = 0.03) {
  const envelope = city?.locationEnvelope || {};
  const lat = Number(mapLocation?.lat);
  const lng = Number(mapLocation?.lng);
  if (![lat, lng, envelope.south, envelope.west, envelope.north, envelope.east].map(Number).every(Number.isFinite)) return true;
  return lat >= Number(envelope.south) - margin && lat <= Number(envelope.north) + margin && lng >= Number(envelope.west) - margin && lng <= Number(envelope.east) + margin;
}

function getConfidenceLabel(confidence) {
  if (confidence >= 0.78) return "High confidence";
  if (confidence >= LOW_CONFIDENCE_THRESHOLD) return "Medium confidence";
  return "Needs review";
}

function extractStoredThreatFields(complaint) {
  const threatAssessment = complaint.ai?.threatAssessment || {};
  return {
    _id: String(complaint._id || ""),
    threatFingerprint: complaint.ai?.imageFingerprint || threatAssessment.integrity?.sha256 || "",
    threatDHash: threatAssessment.integrity?.dHash || "",
    threatCategoryId: threatAssessment.incidentCategoryId || complaint.ai?.categoryId || "",
    threatLevel: threatAssessment.threatLevel || complaint.ai?.threatLevel || "",
    riskScore: threatAssessment.riskScore || complaint.ai?.riskScore || 0
  };
}

function applyThreatPriority(analysis) {
  const threatAssessment = analysis.threatAssessment || analysis.cv?.threatAssessment || null;
  if (!threatAssessment?.threatLevel) {
    return null;
  }

  analysis.threatAssessment = threatAssessment;
  analysis.cv = {
    ...(analysis.cv || {}),
    threatAssessment
  };

  const currentPriority = canonicalPriority(analysis.priority?.level);
  let nextPriority = currentPriority;
  const threatConfidence = Number(threatAssessment.confidence || 0);
  const threatRiskScore = Number(threatAssessment.riskScore || 0);

  analysis.aiMeta = {
    ...(analysis.aiMeta || {}),
    threatEngine: threatAssessment.engine || analysis.aiMeta?.threatEngine || "visual-consensus-threat-v1",
    threatStatus: threatAssessment.status || "not_available",
    threatLevel: threatAssessment.threatLevel,
    threatRiskScore,
    imageFingerprint: threatAssessment.integrity?.sha256 || analysis.aiMeta?.imageFingerprint || ""
  };

  if (threatAssessment.safetyGate?.abstained) {
    return threatAssessment;
  }

  if (threatAssessment.threatLevel === "Critical" && threatConfidence >= 0.46) {
    nextPriority = "Critical";
  } else if (threatAssessment.threatLevel === "High" && threatConfidence >= 0.44 && PRIORITY_ORDER[currentPriority] < PRIORITY_ORDER.High) {
    nextPriority = "High";
  } else if (threatAssessment.threatLevel === "Medium" && currentPriority === "Low") {
    nextPriority = "Medium";
  }

  if (nextPriority !== currentPriority) {
    analysis.priority = {
      ...(analysis.priority || {}),
      level: nextPriority,
      score: Math.max(Number(analysis.priority?.score || 0), threatRiskScore, nextPriority === "Critical" ? 0.86 : nextPriority === "High" ? 0.74 : 0.54)
    };
    analysis.alerts = [
      ...(analysis.alerts || []),
      `Threat assessment raised severity to ${nextPriority}`
    ];
  }

  return threatAssessment;
}

function statusForPriority(priority) {
  if (priority === "Critical" || priority === "High") return "Escalated";
  if (priority === "Medium") return "In Progress";
  return "Queued";
}

function calibrateConfidence(rawConfidence, analysis, payload) {
  const evidenceCount = [
    payload.textComplaint,
    payload.voiceTranscript,
    payload.imageFeatures
  ].filter(Boolean).length;
  let confidence = Number.isFinite(rawConfidence) ? rawConfidence : 0;

  if (evidenceCount <= 1) {
    confidence -= 0.04;
  }

  if ((analysis.aiMeta?.categoryId || "general") === "general") {
    confidence = Math.min(confidence, 0.5);
  }

  if (!analysis.nlp?.confidence || analysis.nlp.confidence < 0.22) {
    confidence -= 0.03;
  }

  if (!payload.textComplaint && !payload.voiceTranscript && analysis.aiMeta?.visionFallbackUsed) {
    confidence = Math.min(confidence, 0.58);
  }

  const topVisionCategory =
    analysis.cv?.candidates?.[0]?.category_id ||
    analysis.cv?.candidates?.[0]?.categoryId ||
    analysis.explainability?.visionCandidates?.[0]?.category_id;
  if (topVisionCategory && analysis.aiMeta?.categoryId && topVisionCategory !== analysis.aiMeta.categoryId) {
    confidence -= 0.08;
  }

  if (analysis.cv?.detected === "No image uploaded" && !payload.textComplaint && !payload.voiceTranscript) {
    confidence = Math.min(confidence, 0.45);
  }

  return Math.max(0, Math.min(1, Number(confidence.toFixed(3))));
}

function buildAiExplanation(analysis, payload, reviewRequired, confidenceScore) {
  const issueType = analysis.nlp?.issueType || "civic issue";
  const category = analysis.nlp?.category || "General";
  const textSources = [
    payload.textComplaint ? "text complaint" : "",
    payload.voiceTranscript ? "voice transcript" : "",
    payload.imageFeatures ? "image evidence" : "",
    payload.location ? "location context" : ""
  ].filter(Boolean);
  const priority = analysis.priority?.level || "Low";
  const confidencePercent = Math.round(confidenceScore * 100);

  return [
    `Classified as ${issueType} in ${category} using ${textSources.join(", ") || "submitted evidence"}.`,
    `Priority is ${priority} with ${confidencePercent}% confidence.`,
    reviewRequired ? "AI confidence is low enough that an admin should review the classification before final routing." : "Classification confidence is sufficient for automatic routing."
  ].join(" ");
}

function appendWeatherContext(explanation, weather) {
  if (!weather?.note) {
    return explanation;
  }

  return `${explanation} Weather context: ${weather.note}`;
}

function logAiDecision({ auth, city, location, analysis, confidenceScore, reviewRequired, routing }) {
  const record = {
    event: "ai_complaint_decision",
    provider: analysis.aiMeta?.provider || "unknown",
    engine: analysis.aiMeta?.engine || "unknown",
    fallbackUsed: Boolean(analysis.aiMeta?.fallbackUsed),
    categoryId: analysis.aiMeta?.categoryId || "general",
    issueType: analysis.nlp?.issueType || "Civic Complaint",
    cityId: city?.slug || "",
    cityName: city?.name || "",
    priority: analysis.priority?.level || "Low",
    confidence: Number(confidenceScore.toFixed(3)),
    reviewRequired,
    authority: routing?.authority || analysis.assignedAuthority,
    department: routing?.department || analysis.nlp?.team,
    unit: routing?.unit || "",
    ward: routing?.ward || "",
    location,
    userRole: auth.role,
    username: auth.username
  };

  console.info(JSON.stringify(record));
}

async function createComplaintFromPayload(auth, payload, context = {}) {
  const city = { ...BENGALURU, slug: BENGALURU.id };
  const location = normalizeLimitedText(payload.location, "Location", MAX_LOCATION_LENGTH);
  const textComplaint = normalizeLimitedText(payload.textComplaint, "Complaint description", MAX_COMPLAINT_TEXT_LENGTH);
  const imageHint = normalizeLimitedText(payload.imageHint, "Image summary", MAX_IMAGE_HINT_LENGTH);
  const voiceTranscript = normalizeLimitedText(payload.voiceTranscript, "Voice transcript", MAX_VOICE_TRANSCRIPT_LENGTH);
  const imagePayload = normalizeImagePayload(payload);

  if (!location) {
    throw createHttpError("Location is required before submitting a complaint.", 400);
  }

  if (!textComplaint && !voiceTranscript && !imageHint && !payload.imageFeatures) {
    throw createHttpError("Add a complaint description, voice transcript, or upload an image before submitting.", 400);
  }

  const locationContext = `${location}, ${city.name}, ${city.state}, India`;
  const suppliedLat = Number(payload.mapLocation?.lat);
  const suppliedLng = Number(payload.mapLocation?.lng);
  const suppliedMapLocation = Number.isFinite(suppliedLat) && Number.isFinite(suppliedLng)
    ? { lat: suppliedLat, lng: suppliedLng }
    : null;
  if (suppliedMapLocation && !isWithinCityEnvelope(city, suppliedMapLocation, 0.02)) {
    const error = createHttpError(`The supplied coordinates appear to be outside ${city.name}.`, 400);
    error.code = "LOCATION_CITY_MISMATCH";
    throw error;
  }
  const geocoded = suppliedMapLocation
    ? { ...suppliedMapLocation, source: "browser_geolocation" }
    : await geocodeLocation(locationContext, city.center);
  const mapLocation = { lat: geocoded.lat, lng: geocoded.lng };
  if (geocoded.source === "nominatim" && !isWithinCityEnvelope(city, mapLocation)) {
    const error = createHttpError(`The location appears to be outside ${city.name}. Make the Bengaluru location more specific.`, 400);
    error.code = "LOCATION_CITY_MISMATCH";
    throw error;
  }

  const previousComplaintFilter = {
    cityId: city.slug,
    ...(auth.userId ? { reporterUserId: String(auth.userId || "") } : { reporterUsername: auth.username })
  };
  const preliminaryAreaIntelligence = extractAreaIntelligence({ location });
  const recentAreaTerms = (preliminaryAreaIntelligence.matchingTerms || [])
    .filter((term) => String(term || "").trim().length >= 3)
    .slice(0, 8);
  const recentAreaFilter = recentAreaTerms.length
    ? {
        $or: recentAreaTerms.map((term) => ({
          location: new RegExp(String(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
        }))
      }
    : {};
  const [previousComplaints, recentAreaComplaints, activeRoutingComplaints] = await Promise.all([
    Complaint.find(previousComplaintFilter).sort({ createdAt: -1 }).limit(5).lean(),
    recentAreaTerms.length
      ? Complaint.find({ cityId: city.slug, ...recentAreaFilter }).sort({ createdAt: -1 }).limit(8).lean()
      : Promise.resolve([]),
    Complaint.find({ cityId: city.slug, status: { $in: ["Queued", "Needs Review", "In Progress", "Escalated"] } })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()
  ]);

  const analysis = await analyzeComplaint({
    textComplaint,
    voiceTranscript,
    machineImageHint: imageHint,
    imageFeatures: payload.imageFeatures || null,
    imageBase64: imagePayload.imageBase64,
    imageMimeType: imagePayload.imageMimeType,
    location: locationContext,
    iotTriggered: Boolean(payload.iotTriggered),
    previousComplaints: previousComplaints.map((complaint) => ({
      type: complaint.type,
      description: complaint.description,
      location: complaint.location,
      priority: complaint.priority,
      status: complaint.status,
      createdAt: complaint.createdAt,
      ...extractStoredThreatFields(complaint)
    })),
    recentAreaComplaints: recentAreaComplaints.map((complaint) => ({
      type: complaint.type,
      description: complaint.description,
      location: complaint.location,
      priority: complaint.priority,
      status: complaint.status,
      reporterUserId: complaint.reporterUserId,
      reporterUsername: complaint.reporterUsername,
      createdAt: complaint.createdAt,
      ...extractStoredThreatFields(complaint)
    }))
  }, context);
  const threatAssessment = applyThreatPriority(analysis);
  analysis.threatAssessment = threatAssessment;
  const checkedWeather = await readDraftContext({
    auth,
    token: payload.weatherContextToken,
    type: "weather",
    location,
    mapLocation: suppliedMapLocation
  });
  const weather = checkedWeather || unavailableWeather("Weather was not checked before submission.");
  weather.note = buildWeatherImpactNote(weather, analysis);
  const rawConfidenceScore = Number(analysis.confidence || Math.max(analysis.priority.score, analysis.cv.score) || 0);
  const confidenceScore = calibrateConfidence(rawConfidenceScore, analysis, {
    textComplaint,
    voiceTranscript,
    imageHint,
    imageFeatures: payload.imageFeatures || null
  });
  const threatReviewRequired = ["needs_review", "request_more_evidence"].includes(threatAssessment?.safetyGate?.action || "");
  const reviewRequired =
    confidenceScore < LOW_CONFIDENCE_THRESHOLD ||
    Boolean(analysis.decision?.reviewRequired || analysis.conflictDetected) ||
    Boolean(threatReviewRequired);
  analysis.reviewRequired = reviewRequired;
  analysis.priority.level = canonicalPriority(analysis.priority?.level);
  analysis.status = analysis.status || statusForPriority(analysis.priority.level);
  if (!reviewRequired && PRIORITY_ORDER[analysis.priority.level] > PRIORITY_ORDER[canonicalPriority(analysis.status)]) {
    analysis.status = statusForPriority(analysis.priority.level);
  }
  const finalStatus = reviewRequired ? "Needs Review" : analysis.status;
  const explanation = appendWeatherContext(buildAiExplanation(analysis, payload, reviewRequired, confidenceScore), weather);
  const routing = await routeComplaint({
    analysis,
    city,
    location,
    mapLocation,
    activeComplaints: activeRoutingComplaints
  });
  const areaIntelligence = extractAreaIntelligence({
    location,
    routing,
    mapLocation
  });
  analysis.areaIntelligence = areaIntelligence;
  analysis.assignedAuthority = routing.authority;
  analysis.nlp.team = routing.department || analysis.nlp.team;
  analysis.alerts = [
    ...(analysis.alerts || []),
    `${routing.unit} assigned through ${routing.department}`,
    `Routing reason: ${routing.routingReason}`
  ];
  if (weather.note) {
    analysis.alerts = [...analysis.alerts, weather.note];
  }
  const civicEvidence = await readDraftContext({
    auth,
    token: payload.civicContextToken,
    type: "civic_evidence",
    location,
    mapLocation: suppliedMapLocation
  }) || {
    status: "unavailable",
    provider: "zenserp",
    reason: "Civic context was not checked before submission.",
    officialSources: [],
    publicContext: [],
    quota: null
  };
  logAiDecision({ auth, city, location, analysis, confidenceScore, reviewRequired, routing });

  const complaint = new Complaint({
    reporter: auth.role,
    reporterUserId: String(auth.userId || ""),
    reporterUsername: auth.username,
    type: analysis.nlp.issueType,
    priority: analysis.priority.level,
    status: finalStatus,
    source: payload.inputSource || "Manual Submission",
    confidence: Math.round(confidenceScore * 100),
    location,
    cityId: city.slug,
    cityName: city.name,
    assignedAuthority: routing.authority,
    routing,
    mapLocation,
    areaIntelligence,
    weather,
    civicEvidence,
    description: analysis.unifiedText || "No complaint text provided.",
    alerts: analysis.alerts,
    followUp: initializeFollowUp({
      priority: analysis.priority.level,
      status: finalStatus
    }),
    statusHistory: [
      {
        status: finalStatus,
        changedBy: auth.username || "system",
        changedAt: new Date(),
        note: reviewRequired
          ? "Created with low AI confidence and marked for admin review."
          : "Complaint created after AI analysis."
      }
    ],
    ai: {
      nlpCategory: analysis.nlp.category,
      cvDetection: analysis.cv.detected,
      cvReason: analysis.cv.reason,
      mlPriorityScore: Number(analysis.priority.score.toFixed(2)),
      recommendedTeam: analysis.nlp.team,
      explanation,
      confidenceLabel: getConfidenceLabel(confidenceScore),
      reviewRequired,
      geocodingSource: geocoded.source,
      provider: analysis.aiMeta?.provider || "unknown",
      engine: analysis.aiMeta?.engine || "unknown",
      model: analysis.aiMeta?.model || "unknown",
      fallbackUsed: Boolean(analysis.aiMeta?.fallbackUsed),
      categoryId: analysis.aiMeta?.categoryId || "general",
      visionEngine: analysis.aiMeta?.visionEngine || "unknown",
      visionProvider: analysis.aiMeta?.visionProvider || analysis.cv?.provider || "unknown",
      visionFallbackUsed: Boolean(analysis.aiMeta?.visionFallbackUsed || analysis.cv?.fallbackUsed),
      visionCandidates: (analysis.cv?.candidates || []).slice(0, 5).map((candidate) => ({
        label: candidate.label || candidate.category_label || "",
        categoryId: candidate.category_id || candidate.categoryId || "",
        confidence: Number(candidate.confidence || 0),
        source: candidate.source || ""
      })),
      confidenceBreakdown: analysis.cv?.confidenceBreakdown || {},
      visualObservations: analysis.cv?.observations || null,
      evaluationVersion: analysis.aiMeta?.evaluationVersion || "unknown",
      threatAssessment,
      threatLevel: threatAssessment?.threatLevel || "",
      riskScore: Number(threatAssessment?.riskScore || 0),
      imageFingerprint: threatAssessment?.integrity?.sha256 || analysis.aiMeta?.imageFingerprint || ""
    }
  });

  await mongoose.connection.transaction(async (session) => {
    await complaint.save({ session });
    await recordAiBaseline(complaint, { session });
    await complaint.save({ session });
  });

  let incidentCluster = null;
  try {
    incidentCluster = await attachComplaintToCluster(complaint);
    analysis.incidentCluster = incidentCluster;
  } catch (error) {
    complaint.alerts = [
      ...(complaint.alerts || []),
      `Incident clustering skipped: ${error.message || "unknown clustering error"}`
    ];
    await complaint.save();
  }

  let broadcast = null;
  try {
    broadcast = await createEmergencyBroadcast({
      complaint,
      analysis,
      routing,
      mapLocation,
      confidenceScore,
      recentAreaComplaints,
      areaIntelligence,
      triggeredBy: auth.username || "system",
      triggeredByUserId: auth.userId || ""
    });
  } catch (error) {
    complaint.alerts = [
      ...(complaint.alerts || []),
      `Emergency broadcast could not be created: ${error.message || "unknown broadcast error"}`
    ];
    await complaint.save();
  }

  if (broadcast) {
    complaint.broadcast = {
      triggered: true,
      broadcastId: broadcast._id,
      status: broadcast.status,
      channels: broadcast.channels || [],
      recipientCount: (broadcast.recipients || []).length,
      message: broadcast.message,
      sentAt: broadcast.sentAt
    };
    complaint.alerts = [
      ...(complaint.alerts || []),
      `Emergency broadcast ${broadcast.status} for ${complaint.priority} priority ${complaint.type}`,
      `Broadcast recipients: ${(broadcast.recipients || []).length}`
    ];
    await complaint.save();
  }

  let incidentCommand = null;
  try {
    incidentCommand = await createIncidentCommand({
      complaint,
      analysis,
      routing,
      confidenceScore,
      broadcast,
      triggeredBy: auth.username || "system"
    });
  } catch (error) {
    complaint.alerts = [
      ...(complaint.alerts || []),
      `Incident command could not be created: ${error.message || "unknown command error"}`
    ];
    await complaint.save();
  }
  const incidentSummary = summarizeIncidentCommand(incidentCommand);
  if (incidentSummary.triggered) {
    complaint.incidentCommand = {
      triggered: true,
      incidentId: incidentCommand._id,
      incidentCode: incidentCommand.incidentCode,
      status: incidentCommand.commandStatus,
      severity: incidentCommand.severity,
      assignedUnit: incidentCommand.assignedUnit,
      slaDueAt: incidentCommand.slaDueAt,
      checklistTotal: (incidentCommand.checklist || []).length,
      checklistDone: (incidentCommand.checklist || []).filter((item) => item.status === "done").length,
      riskScore: incidentCommand.riskScore,
      summary: incidentCommand.summary
    };
    complaint.alerts = [
      ...(complaint.alerts || []),
      `Incident command ${incidentCommand.incidentCode} opened with ${incidentCommand.slaMinutes} minute SLA`
    ];
    await complaint.save();
  }

  analysis.status = finalStatus;
  analysis.mapLocation = mapLocation;
  analysis.weather = weather;
  analysis.civicEvidence = civicEvidence;
  analysis.assignedAuthority = routing.authority;
  analysis.routing = routing;
  analysis.broadcast = broadcast
    ? {
        triggered: true,
        broadcastId: String(broadcast._id),
        status: broadcast.status,
        channels: broadcast.channels || [],
        recipientCount: (broadcast.recipients || []).length,
        message: broadcast.message,
        sentAt: broadcast.sentAt
      }
    : {
        triggered: false
      };
  analysis.incidentCommand = incidentSummary;
  analysis.explainability = {
    explanation,
    confidenceLabel: getConfidenceLabel(confidenceScore),
    reviewRequired,
    geocodingSource: geocoded.source,
    recommendedTeam: analysis.nlp.team,
    routing,
    broadcast: analysis.broadcast,
    incidentCommand: incidentSummary,
    weather,
    civicEvidence,
    threatAssessment,
    provider: analysis.aiMeta?.provider || "unknown",
    engine: analysis.aiMeta?.engine || "unknown",
    fallbackUsed: Boolean(analysis.aiMeta?.fallbackUsed),
    categoryId: analysis.aiMeta?.categoryId || "general",
    visionEngine: analysis.aiMeta?.visionEngine || "unknown",
    visionProvider: analysis.aiMeta?.visionProvider || analysis.cv?.provider || "unknown",
    visionFallbackUsed: Boolean(analysis.aiMeta?.visionFallbackUsed || analysis.cv?.fallbackUsed),
    visionCandidates: (analysis.cv?.candidates || []).slice(0, 5),
    confidenceBreakdown: analysis.cv?.confidenceBreakdown || {},
    visualObservations: analysis.cv?.observations || null,
    threatLevel: threatAssessment?.threatLevel || "",
    threatRiskScore: threatAssessment?.riskScore || 0
  };

  return { analysis, complaint };
}

async function analyzeImagePreview(payload = {}, context = {}) {
  const imagePayload = normalizeImagePayload(payload);
  if (!imagePayload.imageBase64) {
    throw createHttpError("Upload an image before requesting visual analysis.", 400);
  }

  const textComplaint = normalizeLimitedText(payload.textComplaint, "Complaint description", MAX_COMPLAINT_TEXT_LENGTH);
  const voiceTranscript = normalizeLimitedText(payload.voiceTranscript, "Voice transcript", MAX_VOICE_TRANSCRIPT_LENGTH);
  const location = normalizeLimitedText(payload.location, "Location", MAX_LOCATION_LENGTH);

  return analyzeComplaint({
    textComplaint,
    voiceTranscript,
    machineImageHint: "",
    imageFeatures: payload.imageFeatures || null,
    imageBase64: imagePayload.imageBase64,
    imageMimeType: imagePayload.imageMimeType,
    location: location ? `${location}, Bengaluru, Karnataka, India` : "Bengaluru, Karnataka, India",
    iotTriggered: false,
    previousComplaints: [],
    recentAreaComplaints: []
  }, context);
}

function summarizeImageAnalysis(analysis = {}) {
  const cv = analysis.cv || {};
  const observations = cv.observations || {};
  const sceneStatus = String(cv.sceneStatus || observations.status || "not_available").toLowerCase();
  const provider = String(cv.provider || analysis.aiMeta?.visionProvider || "unknown");
  const schemaVersion = String(cv.schemaVersion || observations.schemaVersion || "");
  const fallbackUsed = Boolean(cv.fallbackUsed ?? analysis.aiMeta?.visionFallbackUsed ?? true);
  const processing = ["loading", "warming_up", "busy"].includes(sceneStatus);
  const trustedScene = schemaVersion === "1.0" && sceneStatus === "available";
  const issues = Array.isArray(observations.detectedIssues)
    ? observations.detectedIssues.slice(0, 5).map((item) => ({
        categoryId: String(item.categoryId || ""),
        label: String(item.issue || item.categoryLabel || ""),
        confidence: Number(item.evidenceScore || 0),
        evidence: Array.isArray(item.evidence) ? item.evidence.slice(0, 5).map(String) : []
      }))
    : [];
  const description = trustedScene && observations.description && observations.description !== "No reliable scene description was generated."
    ? String(observations.description)
    : "";
  const incident = trustedScene ? String(issues[0]?.label || "") : "";
  const confidence = trustedScene && incident ? Number(issues[0]?.confidence || cv.score || 0) : 0;
  const reviewRequired = Boolean(
    analysis.reviewRequired ||
      analysis.decision?.reviewRequired ||
      observations.humanReviewRecommended ||
      sceneStatus === "timeout" ||
      (trustedScene && !incident)
  );

  let status = "unavailable";
  if (processing) status = "processing";
  else if (trustedScene && incident && !reviewRequired) status = "complete";
  else if (trustedScene) status = "needs_review";

  let reason = String(observations.uncertainty?.reason || observations.degradedReason || cv.sceneReason || "").trim();
  if (processing) reason = "The scene model is still loading. Analysis will retry automatically.";
  else if (!trustedScene) reason = "Visual analysis is unavailable. The photo will remain attached for human review.";
  else if (!incident && !reason) reason = "The scene was described, but no supported civic incident could be confirmed.";

  return {
    status,
    sceneStatus,
    retryable: processing,
    incident,
    description,
    confidence,
    issues,
    hazards: Array.isArray(observations.hazards) ? observations.hazards.slice(0, 8).map(String) : [],
    affectedInfrastructure: Array.isArray(observations.affectedInfrastructure)
      ? observations.affectedInfrastructure.slice(0, 8).map(String)
      : [],
    imageQuality: observations.imageQuality || { status: "unknown", limitations: [] },
    consistency: observations.textImageConsistency || { status: "not_available", reason: "" },
    multipleIssues: Boolean(observations.multipleIssues),
    additionalEvidenceRequired: Boolean(
      reviewRequired && (!incident || observations.imageQuality?.status === "limited")
    ),
    reviewRequired,
    reason,
    provider,
    model: String(cv.model || observations.model || analysis.aiMeta?.visionEngine || "unknown"),
    fallbackUsed,
    requestId: String(analysis.aiMeta?.requestId || ""),
    failureStage: String(analysis.aiMeta?.upstreamStage || ""),
    upstreamStatus: String(analysis.aiMeta?.upstreamStatus || "")
  };
}

module.exports = {
  analyzeImagePreview,
  summarizeImageAnalysis,
  createComplaintFromPayload,
  createHttpError,
  geocodeLocation,
  isWithinCityEnvelope
};
