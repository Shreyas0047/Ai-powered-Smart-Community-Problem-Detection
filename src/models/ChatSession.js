const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "bot"], required: true },
    content: { type: String, required: true, trim: true },
    intent: { type: String, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  {
    _id: false,
    timestamps: true
  }
);

const chatSessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    messages: {
      type: [chatMessageSchema],
      default: []
    },
    pendingAction: {
      type: {
        stage: { type: String, default: "" },
        draftComplaint: {
          description: { type: String, default: "" },
          location: { type: String, default: "" },
          voiceTranscript: { type: String, default: "" }
        }
      },
      default: () => ({
        stage: "",
        draftComplaint: {
          description: "",
          location: "",
          voiceTranscript: ""
        }
      })
    },
    lastTranscript: { type: String, default: "" }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
