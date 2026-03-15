// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useVoteList from "../useVoteList";

describe("useVoteList", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns voteResult for multiple arenaIds on success", async () => {
        const mockVote1 = { votes: [{ id: 1, votedTo: "challenger" }] };
        const mockVote2 = { votes: [{ id: 2, votedTo: "host" }] };
        vi.mocked(fetch)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockVote1),
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockVote2),
            } as any);

        const { result } = renderHook(() =>
            useVoteList({ arenaIds: [1, 2] })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.voteResult).toEqual([mockVote1, mockVote2]);
        expect(result.current.error).toBeNull();
    });

    it("sets loading to false and does not fetch when arenaIds is empty", async () => {
        const { result } = renderHook(() => useVoteList({ arenaIds: [] }));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.voteResult).toEqual([]);
        expect(fetch).not.toHaveBeenCalled();
    });

    it("sets error when a fetch response is not ok", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({}),
        } as any);

        const { result } = renderHook(() =>
            useVoteList({ arenaIds: [1] })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toContain("Fetch failed for arena 1");
    });

    it("fetches correct URL for each arenaId", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ votes: [] }),
        } as any);

        renderHook(() => useVoteList({ arenaIds: [10, 20] }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith("/api/arenas/10/votes");
            expect(fetch).toHaveBeenCalledWith("/api/arenas/20/votes");
        });
    });
});
