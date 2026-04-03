const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    payerName: { type: String, required: true },
    unitNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    purpose: { type: String, required: true },
    orderId: { type: String, required: true },
    paymentId: { type: String, required: true },
    downloadPath: { type: String, required: true },
    verifiedAt: { type: Date, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
