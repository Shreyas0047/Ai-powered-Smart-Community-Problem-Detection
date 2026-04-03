const { sendBbmpComplaintEmail } = require("../services/emailService");

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_SUBJECT_LENGTH = 180;
const MAX_FILENAME_LENGTH = 120;

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeText(value, maxLength) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  return normalized.slice(0, maxLength);
}

function sanitizeFilename(filename) {
  const cleaned = String(filename || "complaint-report.pdf")
    .replace(/[^A-Za-z0-9._-]/g, "-")
    .slice(0, MAX_FILENAME_LENGTH);

  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned}.pdf`;
}

function validateAttachment(pdfBase64) {
  const normalized = String(pdfBase64 || "").trim();
  if (!normalized) {
    throw createHttpError("Complaint PDF attachment is missing.", 400);
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(normalized)) {
    throw createHttpError("Complaint PDF attachment is invalid.", 400);
  }

  const estimatedBytes = Math.floor((normalized.length * 3) / 4);
  if (estimatedBytes > MAX_ATTACHMENT_BYTES) {
    throw createHttpError("Complaint PDF attachment is too large.", 413);
  }

  return normalized;
}

function validateReport(report) {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    throw createHttpError("Complaint report data is missing.", 400);
  }

  return {
    complaintId: normalizeText(report.complaintId, 60),
    textComplaint: normalizeText(report.textComplaint, 1000),
    location: normalizeText(report.location, 180),
    aiDescription: normalizeText(report.aiDescription, 400),
    authority: normalizeText(report.authority, 80),
    issueType: normalizeText(report.issueType, 100),
    severity: normalizeText(report.severity, 40),
    mapsLink: normalizeText(report.mapsLink, 500)
  };
}

async function emailBbmpComplaint(req, res, next) {
  try {
    const report = validateReport(req.body.report);
    const pdfBase64 = validateAttachment(req.body.pdfBase64);
    const filename = sanitizeFilename(req.body.filename);
    const subject = normalizeText(req.body.subject || report.textComplaint || report.issueType || "Community complaint report", MAX_SUBJECT_LENGTH);

    const emailResult = await sendBbmpComplaintEmail({
      subject,
      report,
      pdfBase64,
      filename
    });

    res.json({
      sent: true,
      message: `Complaint email sent to BBMP at comm@bbmp.gov.in.`,
      messageId: emailResult.messageId
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  emailBbmpComplaint
};
