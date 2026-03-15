// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useVote } from "../useVote";

describe("useVote", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("fetches vote data on mount and returns it", async () => {
        const mockVoteData = { votes: [{ id: 1, votedTo: "challenger" }] };
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockVoteData),
        } as unknown as Response);

        const { result } = renderHook(() =>
            useVote({ arenaId: 1, mine: false })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.voteData).toEqual(mockVoteData);
        expect(result.current.error).toBeNull();
    });

    it("sets existingVote from first vote when mine=true", async () => {
        const mockVoteData = { votes: [{ id: 1, votedTo: "challenger" }] };
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockVoteData),
        } as unknown as Response);

        const { result } = renderHook(() =>
            useVote({ arenaId: 1, mine: true })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.existingVote).toBe("challenger");
    });

    it("sets existingVote to null when mine=false", async () => {
        const mockVoteData = { votes: [{ id: 1, votedTo: "challenger" }] };
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockVoteData),
        } as unknown as Response);

        const { result } = renderHook(() =>
            useVote({ arenaId: 1, mine: false })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.existingVote).toBeNull();
    });

    it("sets error message when fetch is not ok", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({}),
        } as unknown as Response);

        const { result } = renderHook(() =>
            useVote({ arenaId: 1, mine: false })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe("Failed to fetch vote data");
    });

    it("submitVote sends POST when existingVote is null", async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ votes: [] }),
            } as unknown as Response)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            } as unknown as Response);

        const { result } = renderHook(() =>
            useVote({ arenaId: 1, mine: true })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.submitVote(1, "challenger", null);
        });

        expect(fetch).toHaveBeenCalledWith(
            "/api/member/arenas/1/votes",
            expect.objectContaining({ method: "POST" })
        );
    });

    it("submitVote sends PATCH when existingVote is set", async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ votes: [] }),
            } as unknown as Response)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            } as unknown as Response);

        const { result } = renderHook(() =>
            useVote({ arenaId: 1, mine: true })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.submitVote(1, "host", "challenger");
        });

        expect(fetch).toHaveBeenCalledWith(
            "/api/member/arenas/1/votes",
            expect.objectContaining({ method: "PATCH" })
        );
    });
});
