import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/Redis", () => ({
    default: {
        get: vi.fn(),
        setex: vi.fn(),
    },
}));

import { withCache } from "../WithCache";
import redis from "@/lib/Redis";

const mockGet = redis.get as ReturnType<typeof vi.fn>;
const mockSetex = redis.setex as ReturnType<typeof vi.fn>;

describe("withCache", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("cache hit: returns parsed cached value, fn not called", async () => {
        mockGet.mockResolvedValue(JSON.stringify({ name: "cached" }));
        const fn = vi.fn();

        const result = await withCache("test:key", 60, fn);

        expect(result).toEqual({ name: "cached" });
        expect(fn).not.toHaveBeenCalled();
        expect(mockSetex).not.toHaveBeenCalled();
    });

    it("cache miss: calls fn, writes to cache with correct key and TTL", async () => {
        mockGet.mockResolvedValue(null);
        const data = { name: "fresh" };
        const fn = vi.fn().mockResolvedValue(data);

        const result = await withCache("test:key", 300, fn);

        expect(fn).toHaveBeenCalledOnce();
        expect(result).toEqual(data);
        expect(mockSetex).toHaveBeenCalledWith("test:key", 300, JSON.stringify(data));
    });

    it("redis read error: fn still called, result returned without throwing", async () => {
        mockGet.mockRejectedValue(new Error("Redis down"));
        const data = { name: "fresh" };
        const fn = vi.fn().mockResolvedValue(data);

        const result = await withCache("test:key", 60, fn);

        expect(fn).toHaveBeenCalledOnce();
        expect(result).toEqual(data);
    });

    it("redis write error: result still returned without throwing", async () => {
        mockGet.mockResolvedValue(null);
        mockSetex.mockRejectedValue(new Error("Redis down"));
        const fn = vi.fn().mockResolvedValue({ name: "fresh" });

        await expect(withCache("test:key", 60, fn)).resolves.toEqual({ name: "fresh" });
    });
});
