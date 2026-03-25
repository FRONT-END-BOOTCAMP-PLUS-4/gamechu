// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useArenaList } from "../useArenaList";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

const mockData = [{ id: 1, title: "Arena 1" }];

describe("useArenaList", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns arenaList on successful fetch with success:true", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, data: mockData }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList(), {
            wrapper: createWrapper(),
        });

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.arenaList).toEqual(mockData);
        expect(result.current.error).toBeNull();
    });

    it("returns empty array when success is false", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: false }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList(), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.arenaList).toEqual([]);
    });

    it("returns empty array when data is not an array", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, data: null }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList(), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.arenaList).toEqual([]);
    });

    it("sets error on non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ message: "서버 오류" }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList(), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeInstanceOf(Error);
    });

    it("loading starts true and ends false", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, data: [] }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList(), {
            wrapper: createWrapper(),
        });
        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
    });
});
