const Complaint = require("../models/Complaint");
const ChatSession = require("../models/ChatSession");
const { createComplaintFromPayload, createHttpError } = require("../services/complaintService");
const { resolveChatIntent } = require("../services/aiClient");

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 30;

function getUserKey(auth, requestedUserId) {
  const authUserId = String(auth.userId || "").trim();
  const bodyUserId = String(requestedUserId || "").trim();

  if (authUserId && bodyUserId && authUserId !== bodyUserId) {
    throw createHttpError("User identity mismatch for chatbot session.", 403);
  }

  return authUserId || bodyUserId || auth.username;
}

function sanitizeMessage(value) {
  const message = String(value || "").replace(/\s+/g, " ").trim();

  if (!message) {
    throw createHttpError("Chat message cannot be empty.", 400);
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw createHttpError(`Chat message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`, 400);
  }

  return message;
}

async function getOrCreateSession(auth, userId) {
  let session = await ChatSession.findOne({ userId });

  if (!session) {
    session = await ChatSession.create({
      userId,
      username: auth.username,
      role: auth.role,
      messages: []
    });
  }

  return session;
}

function trimSessionMessages(session) {
  if (session.messages.length > MAX_HISTORY_MESSAGES) {
    session.messages = session.messages.slice(-MAX_HISTORY_MESSAGES);
  }
}

async function buildComplaintStatusReply(auth) {
  const scopedFilter =
    auth.userId
      ? { reporterUserId: String(auth.userId || "") }
      : { reporterUsername: auth.username };
  const complaintFilter = auth.permissions.includes("view_dashboard")
    ? {}
    : scopedFilter;

  const complaints = await Complaint.find(complaintFilter).sort({ createdAt: -1 }).limit(3).lean();

  if (!complaints.length) {
    return {
      text: "No complaints are available yet for this account.",
      meta: { complaints: [] }
    };
  }

  const lines = complaints.map((complaint) => {
    return `${complaint.type}: ${complaint.status} (${complaint.priority}) at ${complaint.location}`;
  });

  return {
    text: `Your latest complaints are:\n${lines.join("\n")}`,
    meta: {
      complaints: complaints.map((complaint) => ({
        id: String(complaint._id),
        type: complaint.type,
        status: complaint.status,
        priority: complaint.priority,
        location: complaint.location,
        createdAt: complaint.createdAt
      }))
    }
  };
}

async function handleRaiseComplaint(auth, session, message, voiceTranscript) {
  const stage = String(session.pendingAction?.stage || "");
  const draftComplaint = session.pendingAction?.draftComplaint || {};

  if (!stage) {
    session.pendingAction = {
      stage: "awaiting_description",
      draftComplaint: {
        description: "",
        location: "",
        voiceTranscript: String(voiceTranscript || "").trim()
      }
    };

    return {
      text: "Describe the complaint in one message. After that, I will ask for the location.",
      meta: { intent: "raise_complaint", stage: "awaiting_description" }
    };
  }

  if (stage === "awaiting_description") {
    session.pendingAction = {
      stage: "awaiting_location",
      draftComplaint: {
        description: message,
        location: "",
        voiceTranscript: String(voiceTranscript || draftComplaint.voiceTranscript || "").trim()
      }
    };

    return {
      text: "Now send the complaint location. Use a plain place name like 'Whitefield, Bangalore' or a street/area.",
      meta: { intent: "raise_complaint", stage: "awaiting_location" }
    };
  }

  if (stage === "awaiting_location") {
    const { analysis, complaint } = await createComplaintFromPayload(auth, {
      location: message,
      textComplaint: draftComplaint.description,
      voiceTranscript: draftComplaint.voiceTranscript,
      imageHint: "",
      imageFeatures: null,
      iotTriggered: false,
      inputSource: "Chatbot Submission"
    });

    session.pendingAction = {
      stage: "",
      draftComplaint: {
        description: "",
        location: "",
        voiceTranscript: ""
      }
    };
    session.lastTranscript = "";

    return {
      text: `Complaint created successfully. Type: ${analysis.nlp.issueType}. Status: ${analysis.status}. Priority: ${analysis.priority.level}. Authority: ${analysis.assignedAuthority}.`,
      meta: {
        intent: "raise_complaint",
        complaintCreated: true,
        complaintId: String(complaint._id),
        status: analysis.status,
        priority: analysis.priority.level
      }
    };
  }

  return {
    text: "Describe the complaint first, and then I will ask for the location.",
    meta: { intent: "raise_complaint" }
  };
}

async function getChatHistory(req, res, next) {
  try {
    const userId = getUserKey(req.auth, req.query.userId);
    const session = await getOrCreateSession(req.auth, userId);

    res.json({
      messages: session.messages.map((message) => ({
        sender: message.sender,
        content: message.content,
        intent: message.intent || "",
        createdAt: message.createdAt
      })),
      pendingAction: session.pendingAction || null,
      lastTranscript: session.lastTranscript || ""
    });
  } catch (error) {
    next(error);
  }
}

async function postChatMessage(req, res, next) {
  try {
    const userId = getUserKey(req.auth, req.body.userId);
    const message = sanitizeMessage(req.body.message);
    const voiceTranscript = String(req.body.voiceTranscript || "").trim();
    const session = await getOrCreateSession(req.auth, userId);

    if (voiceTranscript) {
      session.lastTranscript = voiceTranscript;
    }

    session.messages.push({
      sender: "user",
      content: message,
      intent: ""
    });

    const intentResult = await resolveChatIntent({
      userId,
      message,
      voiceTranscript: voiceTranscript || session.lastTranscript || "",
      history: session.messages.map((item) => ({
        sender: item.sender,
        content: item.content
      }))
    });

    let botReply = {
      text: intentResult.response || "I can help with complaint status, raising a complaint, FAQs, and navigation.",
      meta: {
        intent: intentResult.intent || "fallback"
      }
    };

    if (intentResult.intent === "complaint_status") {
      botReply = await buildComplaintStatusReply(req.auth);
      botReply.meta.intent = "complaint_status";
    } else if (intentResult.intent === "raise_complaint" || session.pendingAction?.stage) {
      botReply = await handleRaiseComplaint(req.auth, session, message, voiceTranscript);
    }

    session.messages.push({
      sender: "bot",
      content: botReply.text,
      intent: botReply.meta?.intent || intentResult.intent || "fallback",
      meta: botReply.meta || {}
    });

    trimSessionMessages(session);
    await session.save();

    res.json({
      intent: botReply.meta?.intent || intentResult.intent || "fallback",
      response: botReply.text,
      meta: botReply.meta || {},
      messages: session.messages.map((entry) => ({
        sender: entry.sender,
        content: entry.content,
        intent: entry.intent || "",
        createdAt: entry.createdAt
      })),
      pendingAction: session.pendingAction || null
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getChatHistory,
  postChatMessage
};
