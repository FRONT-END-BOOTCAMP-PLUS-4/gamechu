import { PrismaClient } from "@/prisma/generated";
import { ReviewRepository } from "@/backend/review/domain/repositories/ReviewRepository";
import { CreateReviewDto } from "@/backend/review/application/usecase/dto/CreateReviewDto";
import { UpdateReviewDto } from "@/backend/review/application/usecase/dto/UpdateReviewDto";
import { ReviewDto } from "@/backend/review/application/usecase/dto/ReviewDto";

const prisma = new PrismaClient();

export class PrismaReviewRepository implements ReviewRepository {
    async findByGameId(gameId: number): Promise<ReviewDto[]> {
        const reviews = await prisma.review.findMany({
            where: { gameId },
            include: {
                member: {
                    select: {
                        nickname: true,
                        imageUrl: true,
                    },
                },
            },

            orderBy: { createdAt: "desc" },
        });
        return reviews.map(this.toDto);
    }

    async findByMemberId(memberId: string): Promise<ReviewDto[]> {
        const reviews = await prisma.review.findMany({
            where: { memberId },
            orderBy: { createdAt: "desc" },
        });
        return reviews.map(this.toDto);
    }

    async create(memberId: string, dto: CreateReviewDto): Promise<ReviewDto> {
        const review = await prisma.review.create({
            data: {
                memberId,
                gameId: dto.gameId,
                content: dto.content,
                rating: dto.rating,
            },
        });
        return this.toDto(review);
    }

    async update(reviewId: number, dto: UpdateReviewDto): Promise<ReviewDto> {
        const review = await prisma.review.update({
            where: { id: reviewId },
            data: {
                content: dto.content,
                rating: dto.rating,
            },
        });

        return this.toDto(review);
    }
    async findById(reviewId: number): Promise<ReviewDto | null> {
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });
        return review ? this.toDto(review) : null;
    }
    async delete(reviewId: number): Promise<void> {
        await prisma.review.delete({
            where: { id: reviewId },
        });
    }

    private toDto(review: {
        id: number;
        memberId: string;
        gameId: number;
        content: string;
        rating: number;
        createdAt: Date;
        updatedAt: Date | null;
        member?: {
            nickname: string;
            imageUrl: string | null;
        };
    }): ReviewDto {
        return {
            id: review.id,
            memberId: review.memberId,
            gameId: review.gameId,
            content: review.content,
            rating: review.rating,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            nickname: review.member?.nickname ?? "유저",
            imageUrl: review.member?.imageUrl?.startsWith("http")
                ? review.member.imageUrl
                : "/icons/arena.svg",
        };
    }
}
