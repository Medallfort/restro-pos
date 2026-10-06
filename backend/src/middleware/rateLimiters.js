import { rateLimit } from "express-rate-limit";

const tooMany = (message) => ({ success: false, message });

// Brute force 3la login/register: 10 mo7awalat fachla f 15 d9i9a l kol IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooMany("Too many attempts, please try again in 15 minutes"),
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooMany("Too many requests, slow down"),
});
