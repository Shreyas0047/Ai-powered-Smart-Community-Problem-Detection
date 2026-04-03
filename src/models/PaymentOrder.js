const mongoose = require("mongoose");

const paymentOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    role: { type: String, required: true },
    payerName: { type: String, required: true },
    unitNumber: { type: String, required: true },
    purpose: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PaymentOrder", paymentOrderSchema);
