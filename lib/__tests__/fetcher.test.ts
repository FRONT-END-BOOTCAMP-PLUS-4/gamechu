// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetcher } from "../fetcher";

describe("fetcher", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns parsed JSON on ok response", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ id: 1 }),
        } as unknown as Response);

        const result = await fetcher<{ id: number }>("/api/test");
        expect(result).toEqual({ id: 1 });
    });

    it("throws Error with message from body on non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ message: "권한 없음" }),
        } as unknown as Response);

        await expect(fetcher("/api/test")).rejects.toThrow("권한 없음");
    });

    it("throws fallback message when body has no message field", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 500,
            json: () => Promise.resolve({}),
        } as unknown as Response);

        await expect(fetcher("/api/test")).rejects.toThrow("HTTP 500");
    });

    it("throws when body JSON parse fails", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 503,
            json: () => Promise.reject(new Error("invalid json")),
        } as unknown as Response);

        await expect(fetcher("/api/test")).rejects.toThrow("HTTP 503");
    });
});
