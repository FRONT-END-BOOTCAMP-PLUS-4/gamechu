// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useVote } from "../useVote";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

const mockVoteDto = {
    votes: [{ votedTo: "host-id" }],
    totalCount: 1,
};

describe("useVote", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns voteData on successful fetch", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockVoteDto),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVote({ arenaId: 1, mine: false }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.voteData).toEqual(mockVoteDto);
        expect(result.current.error).toBeNull();
    });

    it("returns existingVote from votes[0].votedTo when mine=true", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockVoteDto),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVote({ arenaId: 1, mine: true }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.existingVote).toBe("host-id");
    });

    it("returns null existingVote when mine=false", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockVoteDto),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVote({ arenaId: 1, mine: false }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.existingVote).toBeNull();
    });

    it("submitVote calls POST when existingVote is null (object params)", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVote({ arenaId: 1, mine: true }),
            { wrapper: createWrapper() }
        );
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.submitVote({
                arenaId: 1,
                votedTo: "challenger",
                existingVote: null,
            });
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/member/arenas/1/votes"),
            expect.objectContaining({ method: "POST" })
        );
    });

    it("submitVote calls PATCH when existingVote is set (object params)", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVote({ arenaId: 1, mine: true }),
            { wrapper: createWrapper() }
        );
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.submitVote({
                arenaId: 1,
                votedTo: "host",
                existingVote: "challenger",
            });
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/member/arenas/1/votes"),
            expect.objectContaining({ method: "PATCH" })
        );
    });
});
