const Complaint = require("../models/Complaint");
const { analyzeComplaint } = require("../services/aiClient");

const ALLOWED_STATUSES = ["Queued", "In Progress", "Resolved", "Escalated"];
const ALLOWED_PRIORITIES = ["Low", "Medium", "High", "Critical"];

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function analyzeAndCreateComplaint(req, res, next) {
  try {
    const location = String(req.body.location || "").trim();
    const textComplaint = String(req.body.textComplaint || "").trim();
    const imageHint = String(req.body.imageHint || "").trim();

    if (!location) {
      throw createHttpError("Location is required before submitting a complaint.", 400);
    }

    if (!textComplaint && !imageHint && !req.body.imageFeatures) {
      throw createHttpError("Add a complaint description or upload an image before submitting.", 400);
    }

    const analysis = await analyzeComplaint({
      textComplaint,
      voiceTranscript: req.body.voiceTranscript || "",
      imageHint,
      imageFeatures: req.body.imageFeatures || null,
      location,
      iotTriggered: Boolean(req.body.iotTriggered)
    });

    const complaint = await Complaint.create({
      reporter: req.auth.role,
      reporterUsername: req.auth.username,
      type: analysis.nlp.issueType,
      priority: analysis.priority.level,
      status: analysis.status,
      source: req.body.inputSource || "Manual Submission",
      confidence: Math.round((analysis.confidence || Math.max(analysis.priority.score, analysis.cv.score)) * 100),
      location,
      assignedAuthority: analysis.assignedAuthority,
      mapLocation: analysis.mapLocation,
      description: analysis.unifiedText || "No complaint text provided.",
      alerts: analysis.alerts,
      ai: {
        nlpCategory: analysis.nlp.category,
        cvDetection: analysis.cv.detected,
        cvReason: analysis.cv.reason,
        mlPriorityScore: Number(analysis.priority.score.toFixed(2)),
        recommendedTeam: analysis.nlp.team
      }
    });

    res.json({
      nlp: analysis.nlp,
      cv: analysis.cv,
      imageUpload: analysis.imageUpload,
      priority: analysis.priority,
      confidence: analysis.confidence,
      status: analysis.status,
      assignedAuthority: analysis.assignedAuthority,
      mapLocation: analysis.mapLocation,
      alerts: analysis.alerts,
      notifications: analysis.notifications,
      auth: {
        role: req.auth.role,
        permissions: req.auth.permissions
      },
      complaintId: complaint._id
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

    if (req.body.status) {
      if (!ALLOWED_STATUSES.includes(req.body.status)) {
        throw createHttpError("Invalid complaint status.", 400);
      }
      complaint.status = req.body.status;
    }

    if (req.body.priority) {
      if (!ALLOWED_PRIORITIES.includes(req.body.priority)) {
        throw createHttpError("Invalid complaint priority.", 400);
      }
      complaint.priority = req.body.priority;
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

module.exports = {
  analyzeAndCreateComplaint,
  updateComplaintStatus,
  acknowledgeAlert
};
