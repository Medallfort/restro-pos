import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

// Kaybeddel req.body b l-version li daz mn schema: champs zaydin kaytms7ou,
// w types kaykounou s7a7 (ex: "5" -> 5)
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path.join(".");
    throw new AppError(400, field ? `${field}: ${issue.message}` : issue.message);
  }
  req.body = result.data;
  next();
};

export const validateObjectId =
  (param = "id") =>
  (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params[param])) throw new AppError(400, "Invalid id");
    next();
  };
