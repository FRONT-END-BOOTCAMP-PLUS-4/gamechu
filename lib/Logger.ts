import pino from "pino";
import { Writable } from "stream";

const isDev = process.env.NODE_ENV === "development";

const globalForLogger = global as unknown as { logger: pino.Logger };

// pino-pretty의 transport({ target }) 방식은 thread-stream 워커를 생성하는데,
// Next.js instrumentation 컨텍스트에서는 워커가 C:\ROOT 경로로 모듈을 탐색해
// MODULE_NOT_FOUND 오류가 발생한다. 동기 스트림 방식으로 우회한다.
//
// Windows에서 SonicBoom/fd 직접 쓰기는 CP949로 해석되어 한국어가 깨진다.
// process.stdout.write(string) 호출은 WriteConsoleW(Unicode) API를 사용하므로
// Writable 래퍼를 통해 문자열로 변환해 전달한다.
//
// pino-pretty는 devDependency이므로 정적 import 대신 런타임 require()로 로드한다.
// isDev가 false일 때 makeStream()은 호출되지 않으므로 프로덕션에서 안전하다.
function makeStream() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pretty = require("pino-pretty") as typeof import("pino-pretty");
    const dest = new Writable({
        write(chunk: Buffer | string, _enc: string, cb: () => void) {
            process.stdout.write(
                typeof chunk === "string" ? chunk : chunk.toString("utf8")
            );
            cb();
        },
        final(cb: () => void) {
            cb();
        },
    });
    return pretty({ colorize: true, sync: true, destination: dest });
}

const logger =
    globalForLogger.logger ??
    (isDev
        ? pino(
              {
                  level: "debug",
                  timestamp: pino.stdTimeFunctions.isoTime,
              },
              makeStream()
          )
        : pino({
              level: "info",
              timestamp: pino.stdTimeFunctions.isoTime,
          }));

// HMR(hot module replacement)에서 모듈이 재평가될 때 중복 인스턴스 생성 방지
// production은 Node.js 모듈 캐시로 보장되므로 global 저장 불필요
if (process.env.NODE_ENV !== "production") globalForLogger.logger = logger;

export default logger;
