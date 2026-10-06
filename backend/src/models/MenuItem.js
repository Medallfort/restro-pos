import mongoose from "mongoose";

// Source de verite dyal les prix (l-client ma y9derch ybeddelhom)
const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);
