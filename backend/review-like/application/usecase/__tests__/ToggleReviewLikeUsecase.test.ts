import { describe, it, expect, vi } from "vitest";
import { ToggleReviewLikeUsecase } from "../ToggleReviewLikeUsecase";
import { createMockReviewLikeRepository } from "@/tests/mocks/createMockReviewLikeRepository";
import { createMockReviewRepository } from "@/tests/mocks/createMockReviewRepository";
import { ApplyReviewScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyReviewScoreUsecase";
import { ReviewDto } from "@/backend/review/application/usecase/dto/ReviewDto";

function makeApplyReviewScoreMock() {
    return { execute: vi.fn().mockResolvedValue(undefined) };
}

const mockReview: ReviewDto = {
    id: 10,
    memberId: "author-1",
    gameId: 100,
    content: "Great game",
    rating: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    nickname: "author",
    imageUrl: null,
    score: 0,
    likeCount: 0,
    isLiked: false,
};

describe("ToggleReviewLikeUsecase", () => {
    it("like path: isLiked returns false → like called, score execute called with LIKE, returns { liked: true }", async () => {
        const likeRepo = createMockReviewLikeRepository();
        const reviewRepo = createMockReviewRepository();
        const applyScore = makeApplyReviewScoreMock();

        vi.mocked(likeRepo.isLiked).mockResolvedValue(false);
        vi.mocked(reviewRepo.findById).mockResolvedValue(mockReview);
        vi.mocked(likeRepo.count).mockResolvedValue(5);
        vi.mocked(likeRepo.like).mockResolvedValue(undefined);

        const usecase = new ToggleReviewLikeUsecase(
            likeRepo,
            reviewRepo,
            applyScore as unknown as ApplyReviewScoreUsecase
        );
        const result = await usecase.execute({ reviewId: 10, memberId: "user-1" });

        expect(likeRepo.like).toHaveBeenCalledWith(10, "user-1");
        expect(applyScore.execute).toHaveBeenCalledWith({
            memberId: "author-1",
            action: "LIKE",
            currentLikeCount: 5,
        });
        expect(result).toEqual({ liked: true });
    });

    it("unlike path: isLiked returns true → unlike called, score execute called with UNLIKE, returns { liked: false }", async () => {
        const likeRepo = createMockReviewLikeRepository();
        const reviewRepo = createMockReviewRepository();
        const applyScore = makeApplyReviewScoreMock();

        vi.mocked(likeRepo.isLiked).mockResolvedValue(true);
        vi.mocked(reviewRepo.findById).mockResolvedValue(mockReview);
        vi.mocked(likeRepo.count).mockResolvedValue(3);
        vi.mocked(likeRepo.unlike).mockResolvedValue(undefined);

        const usecase = new ToggleReviewLikeUsecase(
            likeRepo,
            reviewRepo,
            applyScore as unknown as ApplyReviewScoreUsecase
        );
        const result = await usecase.execute({ reviewId: 10, memberId: "user-1" });

        expect(likeRepo.unlike).toHaveBeenCalledWith(10, "user-1");
        expect(applyScore.execute).toHaveBeenCalledWith({
            memberId: "author-1",
            action: "UNLIKE",
            currentLikeCount: 3,
        });
        expect(result).toEqual({ liked: false });
    });

    it("not found: reviewRepo.findById returns null → throws '리뷰 없음'", async () => {
        const likeRepo = createMockReviewLikeRepository();
        const reviewRepo = createMockReviewRepository();
        const applyScore = makeApplyReviewScoreMock();

        vi.mocked(likeRepo.isLiked).mockResolvedValue(false);
        vi.mocked(reviewRepo.findById).mockResolvedValue(null);
        vi.mocked(likeRepo.count).mockResolvedValue(0);

        const usecase = new ToggleReviewLikeUsecase(
            likeRepo,
            reviewRepo,
            applyScore as unknown as ApplyReviewScoreUsecase
        );
        await expect(
            usecase.execute({ reviewId: 99, memberId: "user-1" })
        ).rejects.toThrow("리뷰 없음");
    });
});
