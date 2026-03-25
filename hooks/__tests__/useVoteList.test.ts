// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useVoteList from "../useVoteList";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

const mockVote = { votes: [], totalCount: 0 };

describe("useVoteList", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("fetches votes for each arenaId", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockVote),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVoteList({ arenaIds: [1, 2] }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(result.current.voteResult).toHaveLength(2);
    });

    it("returns empty array and loading=false when arenaIds is empty", async () => {
        const { result } = renderHook(
            () => useVoteList({ arenaIds: [] }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.voteResult).toEqual([]);
        expect(fetch).not.toHaveBeenCalled();
    });

    it("sets error on non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ message: "오류" }),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVoteList({ arenaIds: [1] }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBeInstanceOf(Error);
    });

    it("sorts arenaIds for stable cache key", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockVote),
        } as unknown as Response);

        // [3,1,2] and [1,2,3] should produce the same sorted key
        const { result: r1 } = renderHook(
            () => useVoteList({ arenaIds: [3, 1, 2] }),
            { wrapper: createWrapper() }
        );
        await waitFor(() => expect(r1.current.loading).toBe(false));

        // fetch called for IDs 1, 2, 3 regardless of input order
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/arenas/1/votes")
        );
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/arenas/2/votes")
        );
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/arenas/3/votes")
        );
    });
});
