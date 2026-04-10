// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useGameReviews } from "../useGameReviews";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

const mockRawReview = {
    id: 1,
    memberId: "user-1",
    imageUrl: "/icons/profile.svg",
    nickname: "테스터",
    createdAt: "2026-01-01T00:00:00Z",
    score: 1000,
    rating: 8,
    content: "좋아요",
    likeCount: 3,
    isLiked: false,
};

describe("useGameReviews", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns enriched reviews on successful fetch", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([mockRawReview]),
        } as unknown as Response);

        const { result } = renderHook(() => useGameReviews(115), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.reviews).toHaveLength(1);
        // rating is halved (8 / 2 = 4)
        expect(result.current.reviews[0].rating).toBe(4);
    });

    it("deleteReview calls DELETE endpoint", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([mockRawReview]),
        } as unknown as Response);

        const { result } = renderHook(() => useGameReviews(115), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({}),
        } as unknown as Response);

        await act(async () => {
            await result.current.deleteReview(42);
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/member/games/115/reviews/42"),
            expect.objectContaining({ method: "DELETE" })
        );
    });
});
