const { sendBbmpComplaintEmail, sendCloseContactsComplaintEmail } = require("../services/emailService");
const Complaint = require("../models/Complaint");
const mongoose = require("mongoose");
const env = require("../config/env");
const { canAccessComplaint } = require("../services/operationalAccessService");

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_SUBJECT_LENGTH = 180;
const MAX_FILENAME_LENGTH = 120;
const MAX_CLOSE_CONTACT_EMAILS = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeText(value, maxLength) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  return normalized.slice(0, maxLength);
}

function maskEmail(email) {
  const value = String(email || "").trim();
  const [name, domain] = value.split("@");
  if (!name || !domain) return value ? "***" : "";
  return `${name.slice(0, 2)}***@${domain}`;
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
    assignedAuthority: normalizeText(report.assignedAuthority || report.authority, 120),
    issueType: normalizeText(report.issueType, 100),
    severity: normalizeText(report.severity || report.priority, 40),
    priority: normalizeText(report.priority || report.severity, 40),
    googleMapsUrl: normalizeText(report.googleMapsUrl || report.mapsLink, 500)
  };
}

function buildTrustedEmailReport(report, complaint) {
  const location = normalizeText(complaint.location || report.location, 180);
  return {
    ...report,
    complaintId: String(complaint._id),
    textComplaint: normalizeText(complaint.description || report.textComplaint, 1000),
    location,
    issueType: normalizeText(complaint.type || report.issueType, 100),
    priority: normalizeText(complaint.priority || report.priority, 40),
    severity: normalizeText(complaint.priority || report.severity, 40),
    assignedAuthority: normalizeText(
      complaint.routing?.authority || complaint.assignedAuthority || report.assignedAuthority,
      120
    ),
    cityName: normalizeText(complaint.cityName || "Bengaluru", 80),
    department: normalizeText(complaint.routing?.department || "Civic response desk", 160),
    officialPortalUrl: normalizeText(complaint.routing?.handoff?.portalUrl || complaint.routing?.portalUrl, 500),
    googleMapsUrl:
      report.googleMapsUrl ||
      (location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}` : "")
  };
}

function authorityEmailDestination(complaint) {
  const routedEmail = normalizeText(complaint.routing?.contactEmail, 180).toLowerCase();
  if (complaint.routing?.handoff?.mode === "verified_email" && EMAIL_PATTERN.test(routedEmail)) return routedEmail;
  if (EMAIL_PATTERN.test(env.bbmpEmailTo)) return env.bbmpEmailTo;
  const error = createHttpError("BBMP email delivery is not configured. Use the official complaint portal shown in the routing details.", 409);
  error.code = "BBMP_EMAIL_UNAVAILABLE";
  throw error;
}

async function assertReportComplaintAccess(req, report) {
  if (!report.complaintId || report.complaintId === "Pending") {
    throw createHttpError("A saved complaint ID is required before sending email.", 400);
  }
  if (!mongoose.Types.ObjectId.isValid(report.complaintId)) {
    throw createHttpError("A valid complaint ID is required before sending email.", 400);
  }

  const complaint = await Complaint.findById(report.complaintId).lean();
  if (!complaint) {
    throw createHttpError("Complaint not found.", 404);
  }

  if (!canAccessComplaint(req.auth || {}, complaint)) {
    throw createHttpError("Permission denied for this complaint email.", 403);
  }

  return complaint;
}

function validateCloseContactEmails(emails) {
  if (!Array.isArray(emails)) {
    throw createHttpError("Contact emails must be provided as a list.", 400);
  }

  const normalizedEmails = [...new Set(emails.map((email) => String(email || "").trim().toLowerCase()).filter(Boolean))];

  if (!normalizedEmails.length) {
    throw createHttpError("Enter at least one contact email.", 400);
  }

  if (normalizedEmails.length > MAX_CLOSE_CONTACT_EMAILS) {
    throw createHttpError("You can inform up to 5 email IDs only.", 400);
  }

  const invalidEmail = normalizedEmails.find((email) => !EMAIL_PATTERN.test(email));
  if (invalidEmail) {
    throw createHttpError(`Enter a valid email address for ${invalidEmail}.`, 400);
  }

  return normalizedEmails;
}

async function emailAuthorityComplaint(req, res, next) {
  try {
    const report = validateReport(req.body.report);
    const complaint = await assertReportComplaintAccess(req, report);
    const trustedReport = buildTrustedEmailReport(report, complaint);
    const destination = authorityEmailDestination(complaint);
    const pdfBase64 = validateAttachment(req.body.pdfBase64);
    const filename = sanitizeFilename(req.body.filename);
    const subject = normalizeText(req.body.subject || report.textComplaint || report.issueType || "Community complaint report", MAX_SUBJECT_LENGTH);

    const emailResult = await sendBbmpComplaintEmail({
      to: destination,
      subject,
      report: trustedReport,
      pdfBase64,
      filename
    });

    res.json({
      sent: true,
      message: `Authority email accepted by the configured mail provider for ${maskEmail(destination)}.`,
      messageId: emailResult.messageId,
      delivery: {
        provider: emailResult.provider || env.emailProvider,
        destination: maskEmail(destination),
        acceptedCount: Array.isArray(emailResult.accepted) ? emailResult.accepted.length : 0,
        rejectedCount: Array.isArray(emailResult.rejected) ? emailResult.rejected.length : 0,
        pendingCount: Array.isArray(emailResult.pending) ? emailResult.pending.length : 0,
        messageId: emailResult.messageId || ""
      }
    });
  } catch (error) {
    next(error);
  }
}

async function informCloseContacts(req, res, next) {
  try {
    const report = validateReport(req.body.report);
    const complaint = await assertReportComplaintAccess(req, report);
    const trustedReport = buildTrustedEmailReport(report, complaint);
    const emails = validateCloseContactEmails(req.body.emails);
    const emailResult = await sendCloseContactsComplaintEmail({
      emails,
      report: trustedReport,
      reporter: req.auth?.username || report.reporter
    });

    res.json({
      sent: true,
      message: `Warning email sent to ${emails.length} close contact${emails.length === 1 ? "" : "s"}.`,
      messageId: emailResult.messageId
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  emailAuthorityComplaint,
  emailBbmpComplaint: emailAuthorityComplaint,
  authorityEmailDestination,
  informCloseContacts
};
