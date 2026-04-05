// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useArenaAutoStatusDetail } from "../useArenaAutoStatusDetail";
import useArenaStore from "@/stores/UseArenaStore";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";

const makeArenaData = (overrides: object) => ({
    id: 1,
    status: 2,
    startDate: null,
    endChatting: null,
    endVote: null,
    challengerId: "challenger-1",
    ...overrides,
});

describe("useArenaAutoStatusDetail", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
        );
        useArenaStore.setState({ arenaData: null });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("calls PATCH immediately for past startDate (status 2 → 3)", async () => {
        const pastDate = new Date(Date.now() - 10_000).toISOString();
        useArenaStore.setState({
            arenaData: makeArenaData({ id: 1, status: 2, startDate: pastDate }) as unknown as ArenaDetailDto,
        });

        renderHook(() => useArenaAutoStatusDetail({}));

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(fetch).toHaveBeenCalledWith(
            "/api/arenas/1",
            expect.objectContaining({ method: "PATCH" })
        );
    });

    it("fires PATCH after delay for future startDate (status 2)", async () => {
        const futureDate = new Date(Date.now() + 5_000).toISOString();
        useArenaStore.setState({
            arenaData: makeArenaData({ id: 2, status: 2, startDate: futureDate }) as unknown as ArenaDetailDto,
        });

        renderHook(() => useArenaAutoStatusDetail({}));

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

    it("does not schedule when arenaData is null", async () => {
        useArenaStore.setState({ arenaData: null });

        renderHook(() => useArenaAutoStatusDetail({}));

        await act(async () => {
            vi.advanceTimersByTime(10_000);
        });

        expect(fetch).not.toHaveBeenCalled();
    });

    it("calls DELETE for status 1 with no challenger and past startDate", async () => {
        const pastDate = new Date(Date.now() - 10_000).toISOString();
        useArenaStore.setState({
            arenaData: makeArenaData({
                id: 3,
                status: 1,
                startDate: pastDate,
                challengerId: null,
            }) as unknown as ArenaDetailDto,
        });

        renderHook(() => useArenaAutoStatusDetail({}));

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(fetch).toHaveBeenCalledWith(
            "/api/arenas/3",
            expect.objectContaining({ method: "DELETE" })
        );
    });

    it("calls onStatusUpdate with new status after update", async () => {
        const pastDate = new Date(Date.now() - 10_000).toISOString();
        const onStatusUpdate = vi.fn();
        useArenaStore.setState({
            arenaData: makeArenaData({ id: 4, status: 2, startDate: pastDate }) as unknown as ArenaDetailDto,
        });

        renderHook(() => useArenaAutoStatusDetail({ onStatusUpdate }));

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(onStatusUpdate).toHaveBeenCalledWith(3);
    });

    it("clears timer on unmount", async () => {
        const futureDate = new Date(Date.now() + 10_000).toISOString();
        useArenaStore.setState({
            arenaData: makeArenaData({ id: 5, status: 2, startDate: futureDate }) as unknown as ArenaDetailDto,
        });

        const { unmount } = renderHook(() => useArenaAutoStatusDetail({}));

        unmount();

        await act(async () => {
            vi.advanceTimersByTime(15_000);
        });

        expect(fetch).not.toHaveBeenCalled();
    });
});
