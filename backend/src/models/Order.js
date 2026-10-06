import mongoose from "mongoose";

export const ORDER_STATUSES = ["In Progress", "Ready", "Completed"];
export const PAYMENT_METHODS = ["Cash", "Online"];

const orderSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, trim: true, default: "" },
      guests: { type: Number, required: true, min: 1 },
    },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: "In Progress" },
    orderDate: { type: Date, default: Date.now },
    // Les prix kay7sbhom server mn MenuItem, machi li jaw mn l-client
    bills: {
      total: { type: Number, required: true },
      tax: { type: Number, required: true },
      totalWithTax: { type: Number, required: true },
    },
    items: [
      {
        _id: false,
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        pricePerQuantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentData: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
    },
    // Audit trail: chkoun creea l-commande
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
