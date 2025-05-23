// backend/review/application/usecase/GetReviewsByGameIdUsecase.ts

import { ReviewDto } from "./dto/ReviewDto";
import { ReviewRepository } from "@/backend/review/domain/repositories/ReviewRepository";
import { ReviewLikeRepository } from "@/backend/review-like/domain/repositories/ReviewLikeRepository";

export class GetReviewsByGameIdUsecase {
    constructor(
        private readonly reviewRepo: ReviewRepository,
        private readonly likeRepo: ReviewLikeRepository
    ) {}

    async execute(gameId: number, viewerId: string): Promise<ReviewDto[]> {
        const rawReviews = await this.reviewRepo.findByGameId(gameId);

        const result = await Promise.all(
            rawReviews.map(async (review) => {
                const likeCount = await this.likeRepo.countLikes(review.id);
                const isLiked = await this.likeRepo.exists(review.id, viewerId);

                return {
                    ...review,
                    likeCount,
                    isLiked,
                };
            })
        );

        return result;
    }
}
