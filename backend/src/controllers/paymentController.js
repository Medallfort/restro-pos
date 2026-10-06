import crypto from "node:crypto";
import env from "../config/env.js";
import Payment from "../models/Payment.js";
import AppError from "../utils/AppError.js";
import { computeBill } from "../utils/pricing.js";
import { toMinorUnits } from "../utils/money.js";

function ensureEnabled() {
  if (!env.RAZORPAY_ENABLED) throw new AppError(503, "Online payment is not configured");
}

// Key ID public (machi secret): l-frontend kaykhdo mn hna bla ma n7tajou VITE_RAZORPAY_KEY_ID
export function getPaymentConfig(req, res) {
  res.json({
    success: true,
    data: {
      onlineEnabled: env.RAZORPAY_ENABLED,
      keyId: env.RAZORPAY_ENABLED ? env.RAZORPAY_KEY_ID : null,
      taxRate: env.TAX_RATE,
    },
  });
}

export async function createPaymentOrder(req, res) {
  ensureEnabled();

  // L-montant kay7sbo server mn les plats, machi l-montant li sifto l-client
  const { bills } = await computeBill(req.body.items);
  const amount = toMinorUnits(bills.totalWithTax);

  const credentials = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency: "INR", receipt: `rcpt_${Date.now()}` }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new AppError(502, "Payment provider error");

  const order = await response.json();
  await Payment.create({
    razorpayOrderId: order.id,
    amount,
    currency: order.currency,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, order });
}

export async function verifyPayment(req, res) {
  ensureEnabled();

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  // timingSafeEqual: comparaison f wa9t tabet (=== kaywe99ef f awel 7arf mkhtalef,
  // w attaquant y9der y7ezzer signature 7arf b 7arf b l-wa9t)
  const valid =
    expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
  if (!valid) throw new AppError(400, "Invalid payment signature");

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id, status: "created" },
    { $set: { status: "paid", razorpayPaymentId: razorpay_payment_id } },
    { returnDocument: "after" }
  );
  if (!payment) throw new AppError(404, "Payment not found or already processed");

  res.json({ success: true, message: "Payment verified successfully" });
}
