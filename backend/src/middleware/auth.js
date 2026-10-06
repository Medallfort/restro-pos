import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

export const COOKIE_NAME = "accessToken";

export const cookieOptions = () => ({
  httpOnly: true, // JavaScript (w XSS) ma y9derch y9ra l-token
  secure: env.COOKIE_SECURE, // ghir HTTPS
  sameSite: "strict", // protection men CSRF
  path: "/",
});

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: `${env.JWT_TTL_HOURS}h`,
  });
}

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new AppError(401, "Please log in");

  let payload;
  try {
    // algorithms explicite: kaymn3 attaques b7al "alg: none" w algorithm confusion
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    throw new AppError(401, "Session expired, please log in again");
  }

  // Kan9raw user mn DB (machi ghir mn token): ila tms7 wla tbeddel role dyalo, kayban direct
  const user = await User.findById(payload.sub);
  if (!user) throw new AppError(401, "Please log in");

  req.user = user;
  next();
}

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) throw new AppError(403, "Access denied");
    next();
  };
