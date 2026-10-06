import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import env from "./config/env.js";
import routes from "./routes/index.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", env.TRUST_PROXY);

  app.use(helmet());
  // Frontend kaykhdem mn nefs l-origin (proxy Vite f dev, Nginx f prod), donc CORS msdoud
  // par defaut. Ila bghiti origin akhor, zido f CORS_ORIGINS.
  if (env.CORS_ORIGINS.length > 0) {
    app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
  }
  if (env.NODE_ENV !== "test") app.use(pinoHttp({ autoLogging: { ignore: (req) => req.url === "/health" } }));

  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.use("/api", apiLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
