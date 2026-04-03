const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    reporter: { type: String, required: true },
    reporterUsername: { type: String, required: true },
    type: { type: String, required: true },
    priority: { type: String, required: true },
    status: { type: String, required: true },
    source: { type: String, required: true },
    confidence: { type: Number, required: true },
    location: { type: String, required: true },
    assignedAuthority: { type: String, default: "Gram Panchayat" },
    mapLocation: {
      lat: Number,
      lng: Number
    },
    description: { type: String, required: true },
    alerts: [{ type: String }],
    ai: {
      nlpCategory: String,
      cvDetection: String,
      cvReason: String,
      mlPriorityScore: Number,
      recommendedTeam: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);
