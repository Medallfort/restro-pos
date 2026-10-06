import AppError from "../utils/AppError.js";

export function notFound(req, res) {
  res.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ success: false, message: err.message });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request body too large" });
  }
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "Value";
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }

  // Erreur ma mtwq3ach: kansjlouha kamla f logs, walakin l-client ma kaychouf 7ta detail
  // (stack trace kat3ti l-attaquant ma3loumat 3la code w versions)
  if (req.log) req.log.error({ err }, "Unhandled error");
  else console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
}
