import redis from "@/lib/redis";
import logger from "@/lib/logger";

export async function withCache<T>(
    key: string,
    ttl: number,
    fn: () => Promise<T>
): Promise<T> {
    try {
        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached) as T;
    } catch {
        logger.warn({ key }, "캐시 읽기 실패 — DB로 폴백")
    }

    const data = await fn();

    try {
        await redis.setex(key, ttl, JSON.stringify(data));
    } catch {
        logger.warn({ key }, "캐시 쓰기 실패")
    }

    return data;
}
