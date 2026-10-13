import mongoose from "mongoose";

// Pending: commande dyal client, katsenna serveur y-confirmiha (y-verifi table)
export const ORDER_STATUSES = ["Pending", "In Progress", "Ready", "Completed", "Cancelled"];
// Ghir Cash. "Online" (Razorpay, 9dim) kayb9a f l-model bach les commandes l9dam yb9aw valides
export const PAYMENT_METHODS = ["Cash"];
export const ORDER_TYPES = ["Dine In", "Takeaway"];

// Les commandes li kat7sb f chiffre d'affaires (Pending ma t-confirmatch, Cancelled tlghat)
export const BILLABLE_STATUSES = ["In Progress", "Ready", "Completed"];

// Chmen statut y9der yji mn b3d kol statut. Completed w Cancelled: commande msdouda
export const STATUS_TRANSITIONS = {
  Pending: ["In Progress", "Cancelled"],
  "In Progress": ["Ready", "Completed", "Cancelled"],
  Ready: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

const orderSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, trim: true, default: "" },
      guests: { type: Number, required: true, min: 1 },
    },
    orderType: { type: String, enum: ORDER_TYPES, default: "Dine In" },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: "In Progress" },
    orderDate: { type: Date, default: Date.now },
    // Les prix kay7sbhom server mn MenuItem, machi li jaw mn l-client
    bills: {
      total: { type: Number, required: true },
      // Remise b points de fidélité (9bel TVA)
      discount: { type: Number, default: 0 },
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
    // Takeaway ma 3ndhach table
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
      required() {
        return this.orderType === "Dine In";
      },
    },
    paymentMethod: { type: String, enum: [...PAYMENT_METHODS, "Online"], default: "Cash" },
    // Points li khdem bihom l-client f had l-commande, w li rb7 mli tsalat (Completed)
    loyalty: {
      pointsRedeemed: { type: Number, default: 0 },
      pointsEarned: { type: Number, default: 0 },
    },
    // Audit trail: chkoun creea l-commande (serveur wla client mn l-app)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Serveur li t-kllef b l-commande: li daha, wla li confirma commande dyal client
    servedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Historique dyal table (GET /table/:id/history)
orderSchema.index({ table: 1, createdAt: -1 });
// "Mes commandes" dyal client
orderSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
