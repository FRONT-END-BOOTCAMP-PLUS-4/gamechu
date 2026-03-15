// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useArenaList } from "../useArenaList";

const mockData = [{ id: 1, title: "Arena 1" }];

describe("useArenaList", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns arenaList on successful fetch", async () => {
        vi.mocked(fetch).mockResolvedValue({
            json: () => Promise.resolve({ success: true, data: mockData }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList());

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.arenaList).toEqual(mockData);
        expect(result.current.error).toBeNull();
    });

    it("sets empty array when response success is false", async () => {
        vi.mocked(fetch).mockResolvedValue({
            json: () => Promise.resolve({ success: false }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.arenaList).toEqual([]);
    });

    it("sets empty array when response data is not an array", async () => {
        vi.mocked(fetch).mockResolvedValue({
            json: () => Promise.resolve({ success: true, data: null }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.arenaList).toEqual([]);
    });

    it("sets error on fetch failure", async () => {
        vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useArenaList());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe("Network error");
    });

    it("loading starts true and ends false", async () => {
        vi.mocked(fetch).mockResolvedValue({
            json: () => Promise.resolve({ success: true, data: [] }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList());
        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
    });
});
