import pino from "pino"

const isDev = process.env.NODE_ENV === "development"

const globalForLogger = global as unknown as { logger: pino.Logger }

const logger =
  globalForLogger.logger ??
  pino({
    level: isDev ? "debug" : "info",
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: isDev
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  })

if (process.env.NODE_ENV !== "production") globalForLogger.logger = logger

export default logger
