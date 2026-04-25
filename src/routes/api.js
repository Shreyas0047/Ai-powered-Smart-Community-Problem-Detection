const express = require("express");
const { getRoles, issueToken, requestRegistrationOtp, register, login } = require("../controllers/authController");
const { getDashboard, resetDashboard } = require("../controllers/dashboardController");
const { analyzeAndCreateComplaint, transcribeComplaintAudio, updateComplaintStatus, acknowledgeAlert } = require("../controllers/complaintController");
const { getChatHistory, postChatMessage } = require("../controllers/chatbotController");
const { emailBbmpComplaint } = require("../controllers/emailController");
const { deleteUser } = require("../controllers/userController");
const { getPaymentConfig, createOrder, verifyPayment } = require("../controllers/paymentController");
const { authenticate, requirePermission } = require("../middleware/auth");

const router = express.Router();

router.get("/roles", getRoles);
router.post("/auth/token", issueToken);
router.post("/auth/register/request-otp", requestRegistrationOtp);
router.post("/auth/register", register);
router.post("/auth/login", login);

router.use(authenticate);

router.get("/dashboard", requirePermission("submit_complaint"), getDashboard);
router.post("/analyze-complaint", requirePermission("submit_complaint"), analyzeAndCreateComplaint);
router.post("/transcribe-audio", requirePermission("submit_complaint"), transcribeComplaintAudio);
router.get("/chatbot/history", requirePermission("submit_complaint"), getChatHistory);
router.post("/chatbot/message", requirePermission("submit_complaint"), postChatMessage);
router.post("/email-bbmp", requirePermission("submit_complaint"), emailBbmpComplaint);
router.patch("/complaints/:id/status", requirePermission("update_complaint_status"), updateComplaintStatus);
router.post("/complaints/:id/alerts/acknowledge", requirePermission("manage_alerts"), acknowledgeAlert);
router.get("/payment-config", requirePermission("submit_complaint"), getPaymentConfig);
router.post("/payments/create-order", requirePermission("submit_complaint"), createOrder);
router.post("/payments/verify", requirePermission("submit_complaint"), verifyPayment);
router.post("/reset-dashboard", requirePermission("reset_dashboard"), resetDashboard);
router.delete("/users/:id", requirePermission("delete_users"), deleteUser);

module.exports = router;
