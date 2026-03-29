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

// HMR(hot module replacement)에서 모듈이 재평가될 때 중복 인스턴스 생성 방지
// production은 Node.js 모듈 캐시로 보장되므로 global 저장 불필요
if (process.env.NODE_ENV !== "production") globalForLogger.logger = logger

export default logger
