// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useNotifications } from "../useNotifications";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

const mockDto = {
    records: [{ id: 1, message: "알림" }],
    currentPage: 1,
    pages: [1],
    endPage: 1,
};

describe("useNotifications", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns notification data on successful fetch", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockDto),
        } as unknown as Response);

        const { result } = renderHook(() => useNotifications(1), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(mockDto);
    });

    it("uses currentPage param (not page)", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockDto),
        } as unknown as Response);

        renderHook(() => useNotifications(3), { wrapper: createWrapper() });

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("currentPage=3")
            );
        });
        // Must NOT use 'page=' — the route only reads 'currentPage'
        expect(fetch).not.toHaveBeenCalledWith(
            expect.stringContaining("page=3")
        );
    });

    it("isLoading starts true and ends false", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockDto),
        } as unknown as Response);

        const { result } = renderHook(() => useNotifications(1), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(true);
        await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
});
