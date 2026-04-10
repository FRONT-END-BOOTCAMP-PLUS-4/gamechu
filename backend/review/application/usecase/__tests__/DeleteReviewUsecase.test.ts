import { describe, it, expect, vi } from "vitest";
import { DeleteReviewUsecase } from "../DeleteReviewUsecase";
import { createMockReviewRepository } from "@/tests/mocks/createMockReviewRepository";
import { ReviewDto } from "../dto/ReviewDto";
import { ReviewLikeRepository } from "@/backend/review-like/domain/repositories/ReviewLikeRepository";
import { ApplyReviewScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyReviewScoreUsecase";

function makeApplyReviewScoreMock() {
    return { execute: vi.fn().mockResolvedValue(undefined) };
}

function makeLikeRepo(likeCount: number) {
    return {
        count: vi.fn().mockResolvedValue(likeCount),
    } as unknown as ReviewLikeRepository;
}

describe("DeleteReviewUsecase", () => {
    it("deletes review and applies DELETE score with likeCount", async () => {
        const repo = createMockReviewRepository();
        const likeRepo = makeLikeRepo(5);
        const applyScore = makeApplyReviewScoreMock();

        vi.mocked(repo.findById).mockResolvedValue({
            id: 1,
            memberId: "m1",
        } as unknown as ReviewDto);
        vi.mocked(repo.delete).mockResolvedValue(undefined);

        const usecase = new DeleteReviewUsecase(
            repo,
            likeRepo,
            applyScore as unknown as ApplyReviewScoreUsecase
        );
        await usecase.execute(1);

        expect(applyScore.execute).toHaveBeenCalledWith({
            memberId: "m1",
            action: "DELETE",
            currentLikeCount: 5,
        });
        expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it("throws if review not found", async () => {
        const repo = createMockReviewRepository();
        const likeRepo = makeLikeRepo(0);
        const applyScore = makeApplyReviewScoreMock();

        vi.mocked(repo.findById).mockResolvedValue(null);

        const usecase = new DeleteReviewUsecase(
            repo,
            likeRepo,
            applyScore as unknown as ApplyReviewScoreUsecase
        );
        await expect(usecase.execute(999)).rejects.toThrow(
            "리뷰가 존재하지 않음"
        );
    });
});
