import { ipKeyGenerator, rateLimit } from "express-rate-limit";

const tooMany = (message) => ({ success: false, message });
const WINDOW_MS = 15 * 60 * 1000;

// Brute force 3la login/register: 10 mo7awalat fachla f 15 d9i9a l kol (IP + email).
// Machi ghir IP: f resto ga3 les clients w les serveurs 3la nefs l-Wi-Fi (nefs IP),
// w ila ghlto 10 d nas ma khassch l-app tt-bloka 3la ga3 nas.
const perEmailLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    return `${ipKeyGenerator(req.ip)}|${email}`;
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooMany("Too many attempts for this account, please try again in 15 minutes"),
});

// Limite kbira 3la l-IP: kaymn3 chi wa7d yjrreb bzzaf dyal les emails (credential stuffing)
const perIpLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 100,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooMany("Too many attempts, please try again in 15 minutes"),
});

export const authLimiter = [perIpLimiter, perEmailLimiter];

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooMany("Too many requests, slow down"),
});
