const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const env = require("../config/env");

function isRazorpayConfigured() {
  return Boolean(env.razorpayKeyId && env.razorpayKeySecret);
}

async function createRazorpayOrder(payload) {
  const auth = Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.description || "Unable to create Razorpay order");
  }

  return data;
}

function verifyRazorpaySignature(orderId, paymentId, signature) {
  const generatedSignature = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

function buildReceiptHtml(receipt) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${receipt.receiptNumber}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #f5f2eb; color: #1e2933; }
      .sheet { max-width: 760px; margin: 32px auto; background: #fff; padding: 32px; border-radius: 20px; box-shadow: 0 18px 38px rgba(0,0,0,0.08); }
      .grid { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; margin-top: 24px; }
      .card { padding: 16px; border: 1px solid #e7e1d8; border-radius: 14px; background: #fcfaf6; }
      .total { margin-top: 22px; padding: 20px; border-radius: 16px; background: #fff3e7; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <h1>Maintenance Payment Receipt</h1>
      <p>AI Smart Community System</p>
      <div class="grid">
        <div class="card"><strong>Receipt No</strong><div>${receipt.receiptNumber}</div></div>
        <div class="card"><strong>Role</strong><div>${receipt.role}</div></div>
        <div class="card"><strong>Payer</strong><div>${receipt.payerName}</div></div>
        <div class="card"><strong>Unit</strong><div>${receipt.unitNumber}</div></div>
        <div class="card"><strong>Order ID</strong><div>${receipt.orderId}</div></div>
        <div class="card"><strong>Payment ID</strong><div>${receipt.paymentId}</div></div>
      </div>
      <div class="total">
        <strong>Amount</strong>
        <div>INR ${receipt.amountInRupees}</div>
        <div>Purpose: ${receipt.purpose}</div>
        <div>Verified at: ${receipt.createdAt}</div>
      </div>
    </div>
  </body>
</html>`;
}

function createReceipt(payment) {
  if (!fs.existsSync(env.receiptsDir)) {
    fs.mkdirSync(env.receiptsDir, { recursive: true });
  }

  const receiptNumber = `RCP-${Date.now()}`;
  const receipt = {
    receiptNumber,
    role: payment.role,
    payerName: payment.payerName,
    unitNumber: payment.unitNumber,
    orderId: payment.orderId,
    paymentId: payment.paymentId,
    amountInRupees: (payment.amount / 100).toFixed(2),
    purpose: payment.purpose,
    createdAt: new Date(payment.verifiedAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    })
  };

  const safeReceiptNumber = receiptNumber.replace(/[^a-zA-Z0-9-_]/g, "");
  const htmlPath = path.join(env.receiptsDir, `${safeReceiptNumber}.html`);
  const jsonPath = path.join(env.receiptsDir, `${safeReceiptNumber}.json`);

  fs.writeFileSync(htmlPath, buildReceiptHtml(receipt), "utf8");
  fs.writeFileSync(jsonPath, JSON.stringify(receipt, null, 2), "utf8");

  return {
    ...receipt,
    downloadPath: `/receipts/${safeReceiptNumber}.html`
  };
}

module.exports = {
  isRazorpayConfigured,
  createRazorpayOrder,
  verifyRazorpaySignature,
  createReceipt
};
