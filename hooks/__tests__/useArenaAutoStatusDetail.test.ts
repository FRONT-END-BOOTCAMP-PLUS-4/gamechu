// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useArenaAutoStatusDetail } from "../useArenaAutoStatusDetail";
import useArenaStore from "@/stores/UseArenaStore";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import { createWrapper } from "@/tests/utils/createQueryWrapper";
import { useQueryClient } from "@tanstack/react-query";

const makeArenaData = (overrides: object) => ({
    id: 1,
    status: 2,
    startDate: new Date().toISOString(),
    endChatting: new Date().toISOString(),
    endVote: new Date().toISOString(),
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

    it("does NOT call fetch — status transitions are handled server-side", async () => {
        useArenaStore.setState({
            arenaData: makeArenaData({ id: 1, status: 2 }) as unknown as ArenaDetailDto,
        });

        renderHook(() => useArenaAutoStatusDetail({}), { wrapper: createWrapper() });

        await act(async () => {
            vi.advanceTimersByTime(90_000); // advance past two 30s intervals
        });

        expect(fetch).not.toHaveBeenCalled();
    });

    it("does not schedule when arenaData is null", async () => {
        useArenaStore.setState({ arenaData: null });
        let capturedClient: ReturnType<typeof useQueryClient> | null = null;

        renderHook(
            () => {
                capturedClient = useQueryClient();
                return useArenaAutoStatusDetail({});
            },
            { wrapper: createWrapper() }
        );

        const spy = vi.spyOn(capturedClient!, "invalidateQueries");

        await act(async () => {
            vi.advanceTimersByTime(30_000);
        });

        expect(spy).not.toHaveBeenCalled();
    });

    it("invalidates arena detail query after 30s interval", async () => {
        useArenaStore.setState({
            arenaData: makeArenaData({ id: 7, status: 3 }) as unknown as ArenaDetailDto,
        });

        let capturedClient: ReturnType<typeof useQueryClient> | null = null;

        renderHook(
            () => {
                capturedClient = useQueryClient();
                return useArenaAutoStatusDetail({});
            },
            { wrapper: createWrapper() }
        );

        const spy = vi.spyOn(capturedClient!, "invalidateQueries");

        await act(async () => {
            vi.advanceTimersByTime(30_000);
            await Promise.resolve();
        });

        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: ["arenaDetail", 7] })
        );
    });

    it("clears interval on unmount", async () => {
        useArenaStore.setState({
            arenaData: makeArenaData({ id: 5, status: 2 }) as unknown as ArenaDetailDto,
        });

        let capturedClient: ReturnType<typeof useQueryClient> | null = null;

        const { unmount } = renderHook(
            () => {
                capturedClient = useQueryClient();
                return useArenaAutoStatusDetail({});
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
