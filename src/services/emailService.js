const nodemailer = require("nodemailer");
const env = require("../config/env");

function isEmailConfigured() {
  return Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass && env.smtpFrom);
}

function createTransporter() {
  if (!isEmailConfigured()) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in .env.");
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });
}

async function sendBbmpComplaintEmail({ subject, report, pdfBase64, filename }) {
  const transporter = createTransporter();
  const safeSubject = String(subject || report?.issueType || "Citizen Complaint Report").trim();
  const mailSubject = safeSubject || "Citizen Complaint Report";

  const bodyLines = [
    "Respected Sir/Madam,",
    "",
    "Greetings from the AI Powered Smart Community Problem Detection System.",
    "",
    "Please find attached the formal complaint report submitted by a citizen for your kind attention and necessary action.",
    "",
    `Complaint ID: ${report?.complaintId || "Pending"}`,
    `Issue Type: ${report?.issueType || "Civic Complaint"}`,
    `Location: ${report?.location || "Unknown"}`,
    `Severity: ${report?.priority || "Low"}`,
    `Assigned Authority: ${report?.assignedAuthority || "Gram Panchayat"}`,
    "",
    "Complaint Description:",
    report?.textComplaint || "No complaint text provided.",
    "",
    "AI Description:",
    report?.aiDescription || "No AI description generated.",
    "",
    `Google Maps Link: ${report?.googleMapsUrl || "N/A"}`,
    "",
    "Kindly review the attached complaint report and take the necessary action.",
    "",
    "Regards,",
    `${report?.reporter || "Citizen"}`,
    "AI Powered Smart Community Problem Detection System"
  ];

  const info = await transporter.sendMail({
    from: env.smtpFrom,
    to: env.bbmpEmailTo,
    subject: mailSubject,
    text: bodyLines.join("\n"),
    attachments: [
      {
        filename: filename || "complaint-report.pdf",
        content: pdfBase64,
        encoding: "base64",
        contentType: "application/pdf"
      }
    ]
  });

  return {
    messageId: info.messageId
  };
}

module.exports = {
  isEmailConfigured,
  sendBbmpComplaintEmail
};
