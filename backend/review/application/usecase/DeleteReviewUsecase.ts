import { ReviewRepository } from "@/backend/review/domain/repositories/ReviewRepository";
import { ReviewLikeRepository } from "@/backend/review-like/domain/repositories/ReviewLikeRepository";
import { ApplyReviewScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyReviewScoreUsecase";

export class DeleteReviewUsecase {
    constructor(
        private readonly reviewRepo: ReviewRepository,
        private readonly likeRepo: ReviewLikeRepository,
        private readonly applyReviewScoreUsecase: ApplyReviewScoreUsecase
    ) {}

    async execute(reviewId: number): Promise<void> {
        const review = await this.reviewRepo.findById(reviewId);
        if (!review) throw new Error("리뷰가 존재하지 않음");

        const likeCount = await this.likeRepo.countLikes(reviewId);

        await this.applyReviewScoreUsecase.execute({
            memberId: review.memberId,
            action: "DELETE",
            currentLikeCount: likeCount,
        });

        await this.reviewRepo.delete(reviewId);
    }
}
