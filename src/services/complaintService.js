const Complaint = require("../models/Complaint");
const { analyzeComplaint } = require("./aiClient");

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createComplaintFromPayload(auth, payload) {
  const location = String(payload.location || "").trim();
  const textComplaint = String(payload.textComplaint || "").trim();
  const imageHint = String(payload.imageHint || "").trim();
  const voiceTranscript = String(payload.voiceTranscript || "").trim();

  if (!location) {
    throw createHttpError("Location is required before submitting a complaint.", 400);
  }

  if (!textComplaint && !voiceTranscript && !imageHint && !payload.imageFeatures) {
    throw createHttpError("Add a complaint description, voice transcript, or upload an image before submitting.", 400);
  }

  const analysis = await analyzeComplaint({
    textComplaint,
    voiceTranscript,
    imageHint,
    imageFeatures: payload.imageFeatures || null,
    location,
    iotTriggered: Boolean(payload.iotTriggered)
  });

  const complaint = await Complaint.create({
    reporter: auth.role,
    reporterUserId: String(auth.userId || ""),
    reporterUsername: auth.username,
    type: analysis.nlp.issueType,
    priority: analysis.priority.level,
    status: analysis.status,
    source: payload.inputSource || "Manual Submission",
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

  return { analysis, complaint };
}

module.exports = {
  createComplaintFromPayload,
  createHttpError
};
