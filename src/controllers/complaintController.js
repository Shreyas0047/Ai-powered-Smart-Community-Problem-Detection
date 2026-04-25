const Complaint = require("../models/Complaint");
const { transcribeAudio } = require("../services/aiClient");
const { createComplaintFromPayload, createHttpError } = require("../services/complaintService");

const ALLOWED_STATUSES = ["Queued", "In Progress", "Resolved", "Escalated"];
const ALLOWED_PRIORITIES = ["Low", "Medium", "High", "Critical"];

async function analyzeAndCreateComplaint(req, res, next) {
  try {
    const { analysis, complaint } = await createComplaintFromPayload(req.auth, req.body);

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

async function transcribeComplaintAudio(req, res, next) {
  try {
    const audioBase64 = String(req.body.audioBase64 || "").trim();
    const filename = String(req.body.filename || "complaint-audio").trim();
    const mimeType = String(req.body.mimeType || "application/octet-stream").trim();

    if (!audioBase64) {
      throw createHttpError("Upload an audio file before requesting transcription.", 400);
    }

    const transcription = await transcribeAudio({
      audioBase64,
      filename,
      mimeType
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
  transcribeComplaintAudio,
  updateComplaintStatus,
  acknowledgeAlert
};
