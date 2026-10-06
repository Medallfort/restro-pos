import mongoose from "mongoose";

export const TABLE_STATUSES = ["Available", "Booked"];

const tableSchema = new mongoose.Schema(
  {
    tableNo: { type: Number, required: true, unique: true, min: 1 },
    seats: { type: Number, required: true, min: 1 },
    status: { type: String, enum: TABLE_STATUSES, default: "Available" },
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Table", tableSchema);
