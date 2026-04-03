const env = require("../config/env");
const Payment = require("../models/Payment");
const PaymentOrder = require("../models/PaymentOrder");
const {
  isRazorpayConfigured,
  createRazorpayOrder,
  verifyRazorpaySignature,
  createReceipt
} = require("../services/razorpayService");

async function getPaymentConfig(req, res) {
  res.json({
    razorpayConfigured: isRazorpayConfigured(),
    keyId: env.razorpayKeyId,
    role: req.auth.role,
    permissions: req.auth.permissions
  });
}

async function createOrder(req, res, next) {
  try {
    if (!isRazorpayConfigured()) {
      throw new Error("Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    }

    const amount = Math.round(Number(req.body.amountInRupees || 0) * 100);
    if (!amount) {
      throw new Error("Enter a valid maintenance amount.");
    }

    const order = await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt: `maint_${Date.now()}`,
      notes: {
        role: req.auth.role,
        payer_name: req.body.payerName || req.auth.role,
        unit_number: req.body.unitNumber || "N/A",
        purpose: req.body.purpose || "Monthly Maintenance"
      }
    });

    await PaymentOrder.create({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      role: req.auth.role,
      payerName: req.body.payerName || req.auth.role,
      unitNumber: req.body.unitNumber || "N/A",
      purpose: req.body.purpose || "Monthly Maintenance"
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.razorpayKeyId,
      payerName: req.body.payerName || req.auth.role,
      role: req.auth.role,
      unitNumber: req.body.unitNumber || "N/A",
      purpose: req.body.purpose || "Monthly Maintenance"
    });
  } catch (error) {
    next(error);
  }
}

async function verifyPayment(req, res, next) {
  try {
    if (!isRazorpayConfigured()) {
      throw new Error("Razorpay keys are not configured.");
    }

    const orderRecord = await PaymentOrder.findOne({ orderId: req.body.razorpay_order_id });
    if (!orderRecord) {
      const error = new Error("Payment order not found or expired.");
      error.statusCode = 404;
      throw error;
    }

    const valid = verifyRazorpaySignature(
      orderRecord.orderId,
      req.body.razorpay_payment_id,
      req.body.razorpay_signature
    );

    if (!valid) {
      throw new Error("Payment signature verification failed.");
    }

    const verifiedAt = new Date();
    const receipt = createReceipt({
      ...orderRecord.toObject(),
      paymentId: req.body.razorpay_payment_id,
      verifiedAt
    });

    await Payment.create({
      receiptNumber: receipt.receiptNumber,
      role: orderRecord.role,
      payerName: orderRecord.payerName,
      unitNumber: orderRecord.unitNumber,
      amount: orderRecord.amount,
      purpose: orderRecord.purpose,
      orderId: orderRecord.orderId,
      paymentId: req.body.razorpay_payment_id,
      downloadPath: receipt.downloadPath,
      verifiedAt
    });

    await PaymentOrder.deleteOne({ _id: orderRecord._id });

    res.json({
      verified: true,
      message: "Maintenance payment verified and receipt created.",
      receipt
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPaymentConfig,
  createOrder,
  verifyPayment
};
