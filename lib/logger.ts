import pino from "pino"

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  serializers: {
    // Ensure errors logged as { error } or { err } are properly serialized
    error: pino.stdSerializers.err,
    err: pino.stdSerializers.err,
  },
  // Redact common sensitive fields to avoid leaking secrets in logs
  redact: [
    // HTTP authorization / cookies
    "req.headers.authorization",
    "req.headers.cookie",
    'res.headers["set-cookie"]',
    "headers.authorization",
    "headers.cookie",
    // Generic secret-like fields
    "*.password",
    "*.token",
    "*.accessToken",
    "*.refreshToken",
    "*.secret",
    "*.apiKey",
  ],
})

export default logger
