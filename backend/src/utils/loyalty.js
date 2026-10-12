import mongoose from "mongoose";
import User from "../models/User.js";
import AppError from "./AppError.js";

// Programme de fidélité: 100 DH khlsthom = 100 points, w kol 100 points = 10 DH remise
export const LOYALTY = {
  pointsPerDh: 1,
  redeemStep: 100,
  redeemValue: 10,
};

// Points 3la montant li khlles l-client (ba3d remise, b TVA). Ghir points kamlin
export const pointsEarnedFor = (amountPaid) => Math.floor(amountPaid * LOYALTY.pointsPerDh);

export const discountFor = (points) => (points / LOYALTY.redeemStep) * LOYALTY.redeemValue;

// Kan9ess points b tari9a atomique: jouj commandes f nefs l-we9t ma y9droch ykhdmo
// b nefs points (solde ma yhbetch ta7t 0)
export async function spendPoints(userId, points) {
  const user = await User.findOneAndUpdate(
    // trusted: $gte jay mn l-code, machi mn l-input (sanitizeFilter)
    { _id: userId, loyaltyPoints: mongoose.trusted({ $gte: points }) },
    { $inc: { loyaltyPoints: -points } }
  );
  if (!user) throw new AppError(400, "Not enough loyalty points");
}

export async function addPoints(userId, points) {
  if (points > 0) await User.updateOne({ _id: userId }, { $inc: { loyaltyPoints: points } });
}
