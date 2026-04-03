const Complaint = require("../models/Complaint");
const Payment = require("../models/Payment");
const PaymentOrder = require("../models/PaymentOrder");
const User = require("../models/User");
const { isRazorpayConfigured } = require("../services/razorpayService");

const iotReadings = [
  { sensor: "Gas Sensor", zone: "Community Kitchen", value: 74, unit: "ppm", status: "Warning" },
  { sensor: "Smoke Sensor", zone: "Parking Basement", value: 11, unit: "AQI", status: "Normal" },
  { sensor: "Fire Sensor", zone: "Library Hall", value: 0, unit: "trigger", status: "Normal" }
];

function summarizePriorityCounts(items) {
  return items.reduce(
    (acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    },
    { Critical: 0, High: 0, Medium: 0, Low: 0 }
  );
}

async function getDashboard(req, res, next) {
  try {
    const canViewDashboard = req.auth.permissions.includes("view_dashboard");
    const canViewSensors = req.auth.permissions.includes("view_sensors");
    const canDeleteUsers = req.auth.permissions.includes("delete_users");
    const complaintFilter = canViewDashboard ? {} : { reporterUsername: req.auth.username };
    const paymentFilter = canViewDashboard ? {} : { role: req.auth.role };

    const [complaints, payments, users] = await Promise.all([
      Complaint.find(complaintFilter).sort({ createdAt: -1 }).lean(),
      Payment.find(paymentFilter).sort({ verifiedAt: -1 }).lean(),
      canDeleteUsers
        ? User.find({}, { username: 1, role: 1, createdAt: 1 }).sort({ role: 1, username: 1 }).lean()
        : Promise.resolve([])
    ]);

    res.json({
      metrics: {
        totalComplaints: complaints.length,
        openComplaints: complaints.filter((item) => item.status !== "Resolved").length,
        criticalAlerts: complaints.filter((item) => item.priority === "Critical").length,
        avgConfidence: complaints.length
          ? Math.round(complaints.reduce((sum, item) => sum + item.confidence, 0) / complaints.length)
          : 0,
        priorityCounts: summarizePriorityCounts(complaints)
      },
      complaints,
      iotReadings: canViewSensors ? iotReadings : [],
      payments: {
        payments,
        stats: {
          totalPayments: payments.length,
          totalAmountInRupees: payments.reduce((sum, item) => sum + item.amount / 100, 0).toFixed(2)
        },
        razorpayConfigured: isRazorpayConfigured()
      },
      manageableUsers: users,
      auth: {
        role: req.auth.role,
        username: req.auth.username,
        permissions: req.auth.permissions
      }
    });
  } catch (error) {
    next(error);
  }
}

async function resetDashboard(req, res, next) {
  try {
    await Promise.all([
      Complaint.deleteMany({}),
      Payment.deleteMany({}),
      PaymentOrder.deleteMany({})
    ]);
    await getDashboard(req, res, next);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
  resetDashboard
};
