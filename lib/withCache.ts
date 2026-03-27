import redis from "@/lib/redis";

export async function withCache<T>(
    key: string,
    ttl: number,
    fn: () => Promise<T>
): Promise<T> {
    try {
        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached) as T;
    } catch {
        console.error(`[cache] read error: ${key}`);
    }

    const data = await fn();

    try {
        await redis.setex(key, ttl, JSON.stringify(data));
    } catch {
        console.error(`[cache] write error: ${key}`);
    }

    return data;
}
