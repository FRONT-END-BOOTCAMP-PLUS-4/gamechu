// backend/review/infra/repositories/prisma/PrismaReviewLikeRepository.ts

import { PrismaClient } from "@/prisma/generated";
import { ReviewLikeRepository } from "@/backend/review-like/domain/repositories/ReviewLikeRepository";
import { prisma } from "@/lib/Prisma";

export class PrismaReviewLikeRepository implements ReviewLikeRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async like(reviewId: number, memberId: string): Promise<void> {
        await this.prisma.reviewLike.create({
            data: { reviewId, memberId },
        });
    }

    async unlike(reviewId: number, memberId: string): Promise<void> {
        await this.prisma.reviewLike.deleteMany({
            where: { reviewId, memberId },
        });
    }

    async isLiked(reviewId: number, memberId: string): Promise<boolean> {
        const like = await this.prisma.reviewLike.findFirst({
            where: { reviewId, memberId },
        });
        return !!like;
    }

    async count(reviewId: number): Promise<number> {
        return this.prisma.reviewLike.count({
            where: { reviewId },
        });
    }
}
