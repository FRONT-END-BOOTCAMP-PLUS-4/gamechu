// backend/review/infra/repositories/prisma/PrismaReviewLikeRepository.ts

import { PrismaClient } from "@/prisma/generated";
import { ReviewLikeRepository } from "@/backend/review-like/domain/repositories/ReviewLikeRepository";

const prisma = new PrismaClient();

export class PrismaReviewLikeRepository implements ReviewLikeRepository {
    async like(reviewId: number, memberId: string): Promise<void> {
        await prisma.reviewLike.create({
            data: { reviewId, memberId },
        });
    }

    async unlike(reviewId: number, memberId: string): Promise<void> {
        await prisma.reviewLike.deleteMany({
            where: { reviewId, memberId },
        });
    }

    async isLiked(reviewId: number, memberId: string): Promise<boolean> {
        const like = await prisma.reviewLike.findFirst({
            where: { reviewId, memberId },
        });
        return !!like;
    }

    async count(reviewId: number): Promise<number> {
        return prisma.reviewLike.count({
            where: { reviewId },
        });
    }
}
