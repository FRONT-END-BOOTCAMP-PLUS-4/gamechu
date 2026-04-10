// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useArenaAutoStatus } from "../useArenaAutoStatus";
import { createWrapper } from "@/tests/utils/createQueryWrapper";
import { useQueryClient } from "@tanstack/react-query";

describe("useArenaAutoStatus", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
        );
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("does NOT call fetch — status transitions are handled server-side", async () => {
        renderHook(
            () => useArenaAutoStatus({ arenaList: [], onStatusUpdate: vi.fn() }),
            { wrapper: createWrapper() }
        );

        await act(async () => {
            vi.advanceTimersByTime(90_000); // advance past two 30s intervals
        });

        expect(fetch).not.toHaveBeenCalled();
    });

    it("invalidates arena queries after 30s interval", async () => {
        let capturedClient: ReturnType<typeof useQueryClient> | null = null;

        renderHook(
            () => {
                capturedClient = useQueryClient();
                return useArenaAutoStatus({ arenaList: [] });
            },
            { wrapper: createWrapper() }
        );

        const spy = vi.spyOn(capturedClient!, "invalidateQueries");

        await act(async () => {
            vi.advanceTimersByTime(30_000);
            await Promise.resolve();
        });

        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: ["arenas"] })
        );
    });

    it("clears interval on unmount — no further invalidations", async () => {
        let capturedClient: ReturnType<typeof useQueryClient> | null = null;

        const { unmount } = renderHook(
            () => {
                capturedClient = useQueryClient();
                return useArenaAutoStatus({ arenaList: [] });
            },
            { wrapper: createWrapper() }
        );

        const spy = vi.spyOn(capturedClient!, "invalidateQueries");

        unmount();

        await act(async () => {
            vi.advanceTimersByTime(60_000);
        });

        expect(spy).not.toHaveBeenCalled();
    });
});
