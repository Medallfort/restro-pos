import mongoose from "mongoose";

// created -> paid (signature verifiee) -> used (mrbouta b commande wa7da)
// Status "used" kaymn3 n3awdou nst3mlou nefs l-paiement l jouj commandes (replay)
export const PAYMENT_STATUSES = ["created", "paid", "used"];

const paymentSchema = new mongoose.Schema(
  {
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: PAYMENT_STATUSES, default: "created" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
