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

        if (rawReviews.length === 0) return [];

        const reviewIds = rawReviews.map((r) => r.id);

        const [countMap, likedSet] = await Promise.all([
            this.likeRepo.countByReviewIds(reviewIds),
            viewerId
                ? this.likeRepo.isLikedByReviewIds(reviewIds, viewerId)
                : Promise.resolve(new Set<number>()),
        ]);

        return rawReviews.map((review) => ({
            ...review,
            likeCount: countMap.get(review.id) ?? 0,
            isLiked: likedSet.has(review.id),
        }));
    }
}
