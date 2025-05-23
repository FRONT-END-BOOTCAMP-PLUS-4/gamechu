import { ToggleReviewLikeDto } from "./dto/ToggleReviewLikeDto";
import { ReviewLikeRepository } from "../../domain/repositories/ReviewLikeRepository";

export class ToggleReviewLikeUsecase {
    constructor(private readonly likeRepo: ReviewLikeRepository) {}

    async execute(dto: ToggleReviewLikeDto): Promise<{ liked: boolean }> {
        const { reviewId, memberId } = dto;

        const alreadyLiked = await this.likeRepo.exists(reviewId, memberId);

        if (alreadyLiked) {
            await this.likeRepo.unlike(reviewId, memberId);
            return { liked: false };
        } else {
            await this.likeRepo.like(reviewId, memberId);
            return { liked: true };
        }
    }
}
