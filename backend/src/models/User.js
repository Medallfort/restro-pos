import mongoose from "mongoose";

export const ROLES = ["Admin", "Cashier", "Waiter"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    // select: false -> l-hash ma kayrje3ch f les requetes ila ma tlebtihch b .select("+password")
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "Waiter" },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function toPublic() {
  return { _id: this._id, name: this.name, email: this.email, phone: this.phone, role: this.role };
};

export default mongoose.model("User", userSchema);
