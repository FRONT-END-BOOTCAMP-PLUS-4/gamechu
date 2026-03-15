// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useArenaAutoStatus } from "../useArenaAutoStatus";
import { ArenaDto } from "@/backend/arena/application/usecase/dto/ArenaDto";

const makeArena = (overrides: object) => ({
    id: 1,
    status: 2,
    startDate: null,
    debateEndDate: null,
    voteEndDate: null,
    challengerId: "challenger-1",
    ...overrides,
});

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

    it("calls PATCH immediately when startDate is in the past (status 2 → 3)", async () => {
        const pastDate = new Date(Date.now() - 10_000).toISOString();

        renderHook(() =>
            useArenaAutoStatus({
                arenaList: [makeArena({ id: 1, status: 2, startDate: pastDate })] as unknown as ArenaDto[],
            })
        );

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(fetch).toHaveBeenCalledWith(
            "/api/arenas/1",
            expect.objectContaining({ method: "PATCH" })
        );
    });

    it("fires PATCH after delay when startDate is in the future (status 2 → 3)", async () => {
        const futureDate = new Date(Date.now() + 5_000).toISOString();

        renderHook(() =>
            useArenaAutoStatus({
                arenaList: [makeArena({ id: 2, status: 2, startDate: futureDate })] as unknown as ArenaDto[],
            })
        );

        expect(fetch).not.toHaveBeenCalled();

        await act(async () => {
            vi.advanceTimersByTime(6_000);
            await Promise.resolve();
        });

        expect(fetch).toHaveBeenCalledWith(
            "/api/arenas/2",
            expect.objectContaining({ method: "PATCH" })
        );
    });

    it("calls DELETE immediately for status 1 with no challenger and past startDate", async () => {
        const pastDate = new Date(Date.now() - 10_000).toISOString();

        renderHook(() =>
            useArenaAutoStatus({
                arenaList: [
                    makeArena({ id: 3, status: 1, startDate: pastDate, challengerId: null }),
                ] as unknown as ArenaDto[],
            })
        );

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(fetch).toHaveBeenCalledWith(
            "/api/arenas/3",
            expect.objectContaining({ method: "DELETE" })
        );
    });

    it("does not schedule delete for status 1 when challenger exists", async () => {
        const pastDate = new Date(Date.now() - 10_000).toISOString();

        renderHook(() =>
            useArenaAutoStatus({
                arenaList: [
                    makeArena({ id: 4, status: 1, startDate: pastDate, challengerId: "challenger" }),
                ] as unknown as ArenaDto[],
            })
        );

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(fetch).not.toHaveBeenCalled();
    });

    it("calls onStatusUpdate callback with correct id and new status", async () => {
        const pastDate = new Date(Date.now() - 10_000).toISOString();
        const onStatusUpdate = vi.fn();

        renderHook(() =>
            useArenaAutoStatus({
                arenaList: [makeArena({ id: 5, status: 2, startDate: pastDate })] as unknown as ArenaDto[],
                onStatusUpdate,
            })
        );

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(onStatusUpdate).toHaveBeenCalledWith(5, 3);
    });

    it("clears timers on unmount", async () => {
        const futureDate = new Date(Date.now() + 10_000).toISOString();

        const { unmount } = renderHook(() =>
            useArenaAutoStatus({
                arenaList: [makeArena({ id: 6, status: 2, startDate: futureDate })] as unknown as ArenaDto[],
            })
        );

        unmount();

        await act(async () => {
            vi.advanceTimersByTime(15_000);
        });

        expect(fetch).not.toHaveBeenCalled();
    });
});
