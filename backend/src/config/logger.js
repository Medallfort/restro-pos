// Logs dyal kol requête (pino-http, JSON f stdout -> "docker compose logs backend").
// redact: cookie dyal session (JWT) ma khassoch yban f logs: li 9ra logs y9der
// ydkhol b smiyt dak l-user 7ta tsala session.
export const httpLoggerOptions = {
  autoLogging: { ignore: (req) => req.url === "/health" },
  redact: {
    paths: ["req.headers.cookie", "req.headers.authorization", 'res.headers["set-cookie"]'],
    censor: "[redacted]",
  },
};
