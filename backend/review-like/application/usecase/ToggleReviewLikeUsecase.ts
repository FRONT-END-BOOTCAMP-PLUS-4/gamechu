import { ToggleReviewLikeDto } from "./dto/ToggleReviewLikeDto";
import { ReviewLikeRepository } from "../../domain/repositories/ReviewLikeRepository";
import { ReviewRepository } from "@/backend/review/domain/repositories/ReviewRepository";
import { ApplyReviewScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyReviewScoreUsecase";

export class ToggleReviewLikeUsecase {
    constructor(
        private readonly likeRepo: ReviewLikeRepository,
        private readonly reviewRepo: ReviewRepository,
        private readonly applyReviewScoreUsecase: ApplyReviewScoreUsecase
    ) {}

    async execute(dto: ToggleReviewLikeDto): Promise<{ liked: boolean }> {
        const { reviewId, memberId } = dto;

        const alreadyLiked = await this.likeRepo.exists(reviewId, memberId);
        const review = await this.reviewRepo.findById(reviewId);
        const likeCount = await this.likeRepo.countLikes(reviewId);

        if (!review) throw new Error("리뷰 없음");

        if (alreadyLiked) {
            await this.likeRepo.unlike(reviewId, memberId);

            // 💥 좋아요 취소 점수 반영
            await this.applyReviewScoreUsecase.execute({
                memberId: review.memberId,
                action: "UNLIKE",
                currentLikeCount: likeCount,
            });

            return { liked: false };
        } else {
            await this.likeRepo.like(reviewId, memberId);

            // ✅ 좋아요 점수 반영
            await this.applyReviewScoreUsecase.execute({
                memberId: review.memberId,
                action: "LIKE",
                currentLikeCount: likeCount,
            });

            return { liked: true };
        }
    }
}
