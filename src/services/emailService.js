const dns = require("dns");
const nodemailer = require("nodemailer");
const env = require("../config/env");

let cachedTransporter = null;

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder(env.smtpFamily === 6 ? "verbatim" : "ipv4first");
}

function isEmailConfigured() {
  if (env.emailProvider === "resend") {
    return Boolean(env.resendApiKey && env.smtpFrom);
  }
  return Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass && env.smtpFrom);
}

function getEmailProvider() {
  return env.emailProvider === "resend" ? "resend" : "smtp";
}

function getEmailHealthSnapshot() {
  const provider = getEmailProvider();
  return {
    provider,
    configured: isEmailConfigured(),
    fromConfigured: Boolean(env.smtpFrom),
    envelopeFromConfigured: Boolean(getEnvelopeFromAddress()),
    resendConfigured: Boolean(env.resendApiKey && env.smtpFrom),
    smtpConfigured: Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass && env.smtpFrom),
    smtpPort: provider === "smtp" ? env.smtpPort : undefined,
    smtpFamily: provider === "smtp" ? env.smtpFamily : undefined
  };
}

function createEmailDeliveryError(message, options = {}) {
  const error = new Error(message);
  error.code = options.code || "SMTP_DELIVERY_FAILED";
  error.statusCode = options.statusCode || 502;
  error.isEmailDeliveryError = true;
  error.deliveryStatus = "not_sent";
  error.retryable = options.retryable !== false;
  error.userMessage = options.userMessage || "Email delivery failed. The email was not sent. Please try again in a minute.";
  return error;
}

function createTransporter() {
  if (!isEmailConfigured()) {
    throw createEmailDeliveryError("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in .env.", {
      code: "SMTP_NOT_CONFIGURED",
      statusCode: 503,
      retryable: false,
      userMessage: "Email service is not configured. The email was not sent. Contact the administrator."
    });
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    family: env.smtpFamily,
    requireTLS: !env.smtpSecure && env.smtpPort === 587,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    },
    tls: {
      minVersion: "TLSv1.2"
    }
  });

  return cachedTransporter;
}

function normalizeConfiguredFrom(value) {
  return String(value || "")
    .trim()
    .replace(/^["'](.+)["']$/, "$1")
    .trim();
}

function getFromAddress() {
  const from = normalizeConfiguredFrom(env.smtpFrom || env.smtpUser);
  if (!from) {
    return "";
  }
  return from.includes("<") ? from : `"Urban Pulse AI" <${from}>`;
}

function getEnvelopeFromAddress() {
  const from = normalizeConfiguredFrom(env.smtpFrom);
  const bracketMatch = from.match(/<([^<>@\s]+@[^<>\s]+)>/);
  if (bracketMatch) {
    return bracketMatch[1].trim();
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) {
    return from;
  }
  return String(env.smtpUser || "").trim();
}

function normalizeRecipients(value) {
  return (Array.isArray(value) ? value : [value])
    .map((email) => String(email || "").trim())
    .filter(Boolean);
}

function maskEmail(email) {
  const value = String(email || "").trim();
  const [name, domain] = value.split("@");
  if (!name || !domain) {
    return value ? "***" : "";
  }
  return `${name.slice(0, 2)}***@${domain}`;
}

function logEmailDelivery({ purpose, recipients, info }) {
  console.log(
    JSON.stringify({
      event: "email_delivery",
      provider: info.provider || getEmailProvider(),
      purpose,
      accepted: (info.accepted || []).map(maskEmail),
      rejected: (info.rejected || []).map(maskEmail),
      pending: (info.pending || []).map(maskEmail),
      messageId: Boolean(info.messageId)
    })
  );
}

function logEmailFailure({ purpose, recipients, error }) {
  console.error(
    JSON.stringify({
      event: "email_failure",
      provider: getEmailProvider(),
      purpose,
      recipients: (recipients || []).map(maskEmail),
      code: error.code || "SMTP_ERROR",
      retryable: error.retryable !== false,
      message: error.message || "SMTP request failed."
    })
  );
}

function normalizeResendError(error) {
  if (error?.isEmailDeliveryError) {
    return error;
  }

  const statusCode = Number(error?.statusCode || error?.status || 502);
  const code = String(error?.code || "RESEND_DELIVERY_FAILED");
  const message = String(error?.message || "Resend email request failed.");
  const retryable = statusCode === 429 || statusCode >= 500;
  const authFailure = statusCode === 401 || statusCode === 403;

  return createEmailDeliveryError(`${code}: ${message}`, {
    code: authFailure ? "RESEND_AUTH_FAILED" : code,
    statusCode,
    retryable: authFailure ? false : retryable,
    userMessage: authFailure
      ? "Email service authentication failed. The OTP was not sent. Contact the administrator."
      : retryable
        ? "Email service is temporarily unavailable. The OTP was not sent. Please try again shortly."
        : "Email provider rejected the email request. The OTP was not sent. Contact the administrator."
  });
}

function normalizeEmailError(error) {
  if (error?.isEmailDeliveryError) {
    return error;
  }

  const code = error?.code || error?.responseCode || "SMTP_ERROR";
  const message = error?.response || error?.message || "SMTP request failed.";
  const details = `${code}: ${message}`;
  const normalizedMessage = String(message).toLowerCase();
  const usesCommonSmtpPort = [25, 465, 587].includes(Number(env.smtpPort));

  if (normalizedMessage.includes("invalid login") || error?.responseCode === 535) {
    return createEmailDeliveryError(`${details} Check SMTP_USER and SMTP_PASS. Gmail requires an App Password, not the normal account password.`, {
      code: "SMTP_AUTH_FAILED",
      statusCode: 502,
      retryable: false,
      userMessage: "Email service authentication failed. The email was not sent. Contact the administrator."
    });
  }

  if (normalizedMessage.includes("self signed") || normalizedMessage.includes("certificate")) {
    return createEmailDeliveryError(`${details} Check SMTP TLS settings for the provider.`, {
      code: "SMTP_TLS_FAILED",
      userMessage: "Email service TLS verification failed. The email was not sent. Contact the administrator."
    });
  }

  if (
    usesCommonSmtpPort &&
    (
      error?.code === "ENETUNREACH" ||
      normalizedMessage.includes("enetunreach") ||
      normalizedMessage.includes("network is unreachable") ||
      normalizedMessage.includes("smtp ports") ||
      normalizedMessage.includes("outbound smtp")
    )
  ) {
    return createEmailDeliveryError(`${details} The hosting environment cannot reach outbound SMTP port ${env.smtpPort}.`, {
      code: "SMTP_PORT_BLOCKED",
      retryable: false,
      userMessage: `Email service cannot reach SMTP port ${env.smtpPort} from this hosting environment. The OTP was not sent. Use a paid host that allows SMTP or switch to an HTTPS email API.`
    });
  }

  if (error?.code === "EAI_AGAIN" || error?.code === "ENOTFOUND") {
    return createEmailDeliveryError(`${details} SMTP host DNS lookup failed from this server.`, {
      code: "SMTP_DNS_FAILED",
      userMessage: "Email service could not resolve the Gmail SMTP host. The email was not sent. Try again shortly."
    });
  }

  if (error?.code === "ETIMEDOUT" || error?.code === "ESOCKET") {
    const maybeBlockedPort = usesCommonSmtpPort && /\b(?:25|465|587)\b/.test(String(message));
    return createEmailDeliveryError(`${details} SMTP connection timed out or the socket failed.`, {
      code: maybeBlockedPort ? "SMTP_PORT_BLOCKED" : "SMTP_CONNECTION_FAILED",
      retryable: !maybeBlockedPort,
      userMessage: maybeBlockedPort
        ? `Email service cannot reach SMTP port ${env.smtpPort} from this hosting environment. The OTP was not sent. Use a paid host that allows SMTP or switch to an HTTPS email API.`
        : "Email service could not connect to Gmail SMTP. The email was not sent. Try again shortly."
    });
  }

  if (error?.code === "ECONNREFUSED" || error?.code === "ECONNRESET") {
    return createEmailDeliveryError(`${details} SMTP connection was refused or reset.`, {
      code: "SMTP_CONNECTION_RESET",
      userMessage: "Email service connection was refused or reset. The email was not sent. Try again shortly."
    });
  }

  return createEmailDeliveryError(details, {
    code: String(code || "SMTP_ERROR"),
    userMessage: "Email delivery failed. The email was not sent. Please try again in a minute."
  });
}

async function verifySmtpConnection() {
  try {
    if (env.emailProvider === "resend") {
      if (!isEmailConfigured()) {
        throw createEmailDeliveryError("Resend is not configured. Set RESEND_API_KEY and SMTP_FROM.", {
          code: "RESEND_NOT_CONFIGURED",
          statusCode: 503,
          retryable: false,
          userMessage: "Email service is not configured. The email was not sent. Contact the administrator."
        });
      }
      return {
        ok: true,
        provider: "resend",
        baseUrl: env.resendBaseUrl,
        from: getFromAddress()
      };
    }

    const transporter = createTransporter();
    await transporter.verify();
    return {
      ok: true,
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      family: env.smtpFamily,
      from: getFromAddress()
    };
  } catch (error) {
    throw env.emailProvider === "resend" ? normalizeResendError(error) : normalizeEmailError(error);
  }
}

async function sendResendMail(options, recipients) {
  if (!isEmailConfigured()) {
    throw createEmailDeliveryError("Resend is not configured. Set RESEND_API_KEY and SMTP_FROM.", {
      code: "RESEND_NOT_CONFIGURED",
      statusCode: 503,
      retryable: false,
      userMessage: "Email service is not configured. The email was not sent. Contact the administrator."
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${env.resendBaseUrl.replace(/\/+$/, "")}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: options.from || getFromAddress(),
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: Array.isArray(options.attachments)
          ? options.attachments.map((attachment) => ({
              filename: attachment.filename,
              content: attachment.content
            }))
          : undefined
      }),
      signal: controller.signal
    });

    const responseText = await response.text();
    let data = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (_error) {
      data = {};
    }

    if (!response.ok || data?.error) {
      const providerError = data?.error || data;
      const error = new Error(providerError?.message || providerError?.name || `Resend returned HTTP ${response.status}.`);
      error.statusCode = response.status;
      error.code = providerError?.name || providerError?.code || "RESEND_DELIVERY_FAILED";
      throw error;
    }

    return {
      provider: "resend",
      messageId: data.id || "",
      accepted: recipients,
      rejected: [],
      pending: []
    };
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("Resend request timed out.");
      timeoutError.statusCode = 504;
      timeoutError.code = "RESEND_TIMEOUT";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function sendMail(options) {
  const recipients = normalizeRecipients(options.to);
  try {
    if (!recipients.length) {
      throw createEmailDeliveryError("At least one recipient email is required.", {
        code: "SMTP_RECIPIENT_REQUIRED",
        statusCode: 400,
        retryable: false,
        userMessage: "Recipient email is missing. The email was not sent."
      });
    }

    const info = env.emailProvider === "resend"
      ? await sendResendMail(options, recipients)
      : await createTransporter().sendMail({
          ...options,
          from: options.from || getFromAddress(),
          envelope: {
            from: getEnvelopeFromAddress(),
            to: recipients
          }
        });

    if (recipients.length && !info.accepted?.length) {
      const rejected = (info.rejected || []).join(", ") || "all recipients";
      throw createEmailDeliveryError(`SMTP provider rejected ${rejected}.`, {
        code: "SMTP_RECIPIENT_REJECTED",
        userMessage: "Email provider rejected the recipient address. The email was not sent."
      });
    }

    logEmailDelivery({
      purpose: options.purpose || "general",
      recipients,
      info
    });

    return info;
  } catch (error) {
    const normalizedError = env.emailProvider === "resend"
      ? normalizeResendError(error)
      : normalizeEmailError(error);
    logEmailFailure({
      purpose: options.purpose || "general",
      recipients,
      error: normalizedError
    });
    throw normalizedError;
  }
}

function buildOtpHtml({ title, intro, otp }) {
  return `
    <div style="margin:0;padding:32px;background:#f5f3ef;font-family:Arial,sans-serif;color:#1b1c1a;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e4e2de;border-radius:18px;padding:28px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#747874;">Urban Pulse AI</p>
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;color:#1b1c1a;">${title}</h1>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#444844;">${intro}</p>
        <div style="font-size:34px;letter-spacing:0.22em;font-weight:700;background:#f5f3ef;border-radius:14px;padding:18px;text-align:center;color:#1b1c1a;">${otp}</div>
        <p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:#444844;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
        <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#747874;">If you did not request this, you can ignore this email.</p>
      </div>
    </div>
  `;
}

async function sendRegistrationOtpEmail({ email, otp, username }) {
  const safeEmail = String(email || "").trim();
  const safeUsername = String(username || "Citizen").trim() || "Citizen";
  const code = String(otp || "").trim();

  if (!safeEmail || !code) {
    throw new Error("Email and OTP are required before sending the registration mail.");
  }

  const bodyLines = [
    `Hello ${safeUsername},`,
    "",
    "Your one-time password for Urban Pulse AI registration is:",
    "",
    code,
    "",
    "This OTP is valid for 5 minutes. Do not share it with anyone.",
    "",
    "If you did not request this registration, you can ignore this email."
  ];

  const info = await sendMail({
    purpose: "registration_otp",
    to: safeEmail,
    subject: "Urban Pulse AI verification code",
    text: bodyLines.join("\n"),
    html: buildOtpHtml({
      title: "Your verification code",
      intro: "Use this code to complete your Urban Pulse AI registration.",
      otp: code
    })
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted || [],
    rejected: info.rejected || []
  };
}

async function sendPasswordResetOtpEmail({ email, otp }) {
  const safeEmail = String(email || "").trim();
  const code = String(otp || "").trim();

  if (!safeEmail || !code) {
    throw new Error("Email and OTP are required before sending the password reset mail.");
  }

  const bodyLines = [
    "Hello,",
    "",
    "Your one-time password for resetting your Urban Pulse AI password is:",
    "",
    code,
    "",
    "This OTP is valid for 5 minutes. Do not share it with anyone.",
    "",
    "If you did not request this password reset, you can ignore this email."
  ];

  const info = await sendMail({
    purpose: "password_reset_otp",
    to: safeEmail,
    subject: "Urban Pulse AI password reset code",
    text: bodyLines.join("\n"),
    html: buildOtpHtml({
      title: "Your password reset code",
      intro: "Use this code to reset your Urban Pulse AI password.",
      otp: code
    })
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted || [],
    rejected: info.rejected || []
  };
}

async function sendBbmpComplaintEmail({ to = env.bbmpEmailTo, subject, report, pdfBase64, filename }) {
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
    `City: ${report?.cityName || "Bengaluru"}`,
    `Issue Type: ${report?.issueType || "Civic Complaint"}`,
    `Location: ${report?.location || "Unknown"}`,
    `Severity: ${report?.priority || "Low"}`,
    `Assigned Authority: ${report?.assignedAuthority || "Gram Panchayat"}`,
    `Assigned Department: ${report?.department || "Civic response desk"}`,
    "",
    "Complaint Description:",
    report?.textComplaint || "No complaint text provided.",
    "",
    "AI Description:",
    report?.aiDescription || "No AI description generated.",
    "",
    `Google Maps Link: ${report?.googleMapsUrl || "N/A"}`,
    `Official Complaint Portal: ${report?.officialPortalUrl || "N/A"}`,
    "",
    "Kindly review the attached complaint report and take the necessary action.",
    "",
    "Regards,",
    `${report?.reporter || "Citizen"}`,
    "AI Powered Smart Community Problem Detection System"
  ];

  const info = await sendMail({
    purpose: "authority_complaint",
    to,
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

async function sendAuthorityTicketEmail({ to, ticket, payload }) {
  const info = await sendMail({
    purpose: "authority_ticket",
    to,
    subject: `[${payload.severity}] Civic ticket ${ticket.ticketCode}: ${payload.issueType}`,
    text: [
      "A tracked civic ticket was submitted by Urban Pulse AI.",
      "",
      `Ticket: ${ticket.ticketCode}`,
      `Complaint: ${payload.complaintId}`,
      `Issue: ${payload.issueType}`,
      `Category: ${payload.categoryId}`,
      `Severity: ${payload.severity}`,
      `City: ${payload.cityName} (${payload.cityId})`,
      `Location: ${payload.location}`,
      `Department: ${payload.department}`,
      `Authority: ${payload.authority}`,
      `Handoff: ${payload.handoffMode}`,
      `Official portal: ${payload.officialPortalUrl || "N/A"}`,
      "",
      payload.description,
      "",
      `Idempotency key: ${ticket.idempotencyKey}`,
      "Reply with the external ticket reference so an administrator can reconcile this record."
    ].join("\n")
  });
  return { messageId: info.messageId };
}

function getSeverityWarning(severity) {
  const level = String(severity || "Low").trim().toLowerCase();

  if (level === "critical") {
    return "Warning: This complaint has been marked CRITICAL. Please stay alert, avoid the affected area if needed, and take immediate precautions.";
  }

  if (level === "high") {
    return "Warning: This complaint has been marked HIGH severity. Please be careful around the affected area and act quickly if it impacts your safety.";
  }

  if (level === "medium") {
    return "Warning: This complaint has been marked MEDIUM severity. Please remain cautious and keep an eye on the issue until it is resolved.";
  }

  return "Warning: This complaint has been marked LOW severity, but it still needs attention. Please stay aware and avoid ignoring the issue.";
}

async function sendCloseContactsComplaintEmail({ emails, report, reporter }) {
  const safeEmails = Array.isArray(emails) ? emails.map((email) => String(email || "").trim()).filter(Boolean) : [];
  const safeReporter = String(reporter || report?.reporter || "Citizen").trim() || "Citizen";
  const severity = report?.priority || report?.severity || "Low";

  if (!safeEmails.length) {
    throw new Error("At least one contact email is required.");
  }

  const bodyLines = [
    "Hello,",
    "",
    "This is an important community safety update from the AI Powered Smart Community Problem Detection System.",
    "",
    getSeverityWarning(severity),
    "",
    `Complaint from: ${safeReporter}`,
    `Severity: ${severity}`,
    "",
    "Complaint Description:",
    report?.textComplaint || "No complaint description was provided.",
    "",
    "Please take care of this issue and stay safe until it is resolved.",
    "",
    "Regards,",
    "AI Powered Smart Community Problem Detection System"
  ];

  const info = await sendMail({
    purpose: "close_contacts",
    to: safeEmails,
    subject: `Community issue warning: ${severity} severity complaint`,
    text: bodyLines.join("\n")
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted || []
  };
}

async function sendEmergencyBroadcastEmail({ emails, complaint, routing, message }) {
  const safeEmails = [...new Set((Array.isArray(emails) ? emails : []).map((email) => String(email || "").trim().toLowerCase()).filter(Boolean))];

  if (!safeEmails.length) {
    throw new Error("At least one emergency broadcast recipient is required.");
  }

  const bodyLines = [
    "Local civic alert from Urban Pulse AI.",
    "",
    message,
    "",
    `Issue: ${complaint.type}`,
    `Severity: ${complaint.priority}`,
    `Location: ${complaint.location}`,
    `Assigned unit: ${routing?.unit || complaint.assignedAuthority}`,
    `Department: ${routing?.department || "Response team"}`,
    "",
    "Why you are receiving this:",
    "You are an admin, a nearby prior reporter, or you opted in to local alerts for this area.",
    "",
    "Please avoid the affected area if needed, follow local authority instructions, and do not put yourself at risk while checking the issue.",
    "",
    "This alert was generated because the AI classified the complaint as a serious local risk."
  ];

  const info = await sendMail({
    purpose: "emergency_broadcast",
    to: safeEmails,
    subject: `Local civic alert: ${complaint.type} near ${complaint.location}`,
    text: bodyLines.join("\n")
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted || []
  };
}

module.exports = {
  getEmailHealthSnapshot,
  isEmailConfigured,
  sendBbmpComplaintEmail,
  sendAuthorityTicketEmail,
  sendCloseContactsComplaintEmail,
  sendEmergencyBroadcastEmail,
  sendPasswordResetOtpEmail,
  sendRegistrationOtpEmail,
  verifySmtpConnection
};
