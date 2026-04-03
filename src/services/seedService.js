const Complaint = require("../models/Complaint");

const initialComplaints = [
  {
    reporter: "Citizen",
    reporterUsername: "demo_user",
    type: "Road Damage",
    priority: "High",
    status: "In Progress",
    source: "Text + Image",
    confidence: 92,
    location: "North Gate Road",
    assignedAuthority: "Municipality",
    mapLocation: { lat: 12.973, lng: 77.588 },
    description: "Large pothole causing traffic disruption near the main entrance.",
    alerts: ["Admin notified", "Residents near North Gate alerted"],
    ai: {
      nlpCategory: "Infrastructure",
      cvDetection: "Pothole / surface crack",
      cvReason: "Seeded demo record",
      mlPriorityScore: 0.91,
      recommendedTeam: "Maintenance Team"
    },
    createdAt: new Date("2026-03-30T08:25:00.000Z")
  },
  {
    reporter: "Citizen",
    reporterUsername: "demo_user_2",
    type: "Garbage Overflow",
    priority: "Medium",
    status: "Queued",
    source: "Voice Complaint",
    confidence: 84,
    location: "Market Street",
    assignedAuthority: "Gram Panchayat",
    mapLocation: { lat: 12.966, lng: 77.603 },
    description: "Dustbins are overflowing and attracting stray animals.",
    alerts: ["Sanitation supervisor notified"],
    ai: {
      nlpCategory: "Sanitation",
      cvDetection: "No image uploaded",
      cvReason: "Seeded demo record",
      mlPriorityScore: 0.67,
      recommendedTeam: "Sanitation Team"
    },
    createdAt: new Date("2026-03-31T04:10:00.000Z")
  },
  {
    reporter: "Admin",
    reporterUsername: "demo_admin",
    type: "Gas Leak Risk",
    priority: "Critical",
    status: "Escalated",
    source: "IoT Sensor",
    confidence: 97,
    location: "Community Kitchen",
    assignedAuthority: "Municipality",
    mapLocation: { lat: 12.978, lng: 77.612 },
    description: "Gas concentration crossed the safe threshold for 3 consecutive readings.",
    alerts: ["Emergency admin alert", "Nearby users warned to avoid kitchen area"],
    ai: {
      nlpCategory: "Safety",
      cvDetection: "Sensor-triggered issue",
      cvReason: "Seeded demo record",
      mlPriorityScore: 0.98,
      recommendedTeam: "Emergency Response"
    },
    createdAt: new Date("2026-03-31T06:40:00.000Z")
  }
];

async function seedComplaintsIfEmpty() {
  const count = await Complaint.countDocuments();
  if (!count) {
    await Complaint.insertMany(initialComplaints);
  }
}

async function seedAll() {
  await seedComplaintsIfEmpty();
}

module.exports = {
  seedComplaintsIfEmpty,
  seedAll
};
