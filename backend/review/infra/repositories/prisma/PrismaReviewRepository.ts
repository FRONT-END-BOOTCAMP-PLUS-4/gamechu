import { PrismaClient } from "@/prisma/generated";
import { ReviewRepository } from "@/backend/review/domain/repositories/ReviewRepository";
import { CreateReviewDto } from "@/backend/review/application/usecase/dto/CreateReviewDto";
import { UpdateReviewDto } from "@/backend/review/application/usecase/dto/UpdateReviewDto";
import { ReviewDto } from "@/backend/review/application/usecase/dto/ReviewDto";
import { ReviewByMembersDto } from "@/backend/review/application/usecase/dto/ReviewByMembersDto";
import { prisma } from "@/lib/prisma";

export class PrismaReviewRepository implements ReviewRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async findByGameId(gameId: number): Promise<ReviewDto[]> {
        const reviews = await this.prisma.review.findMany({
            where: { gameId },
            include: {
                member: {
                    select: {
                        nickname: true,
                        imageUrl: true,
                        score: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return reviews.map(this.toDto);
    }

    async findByMemberId(memberId: string): Promise<ReviewByMembersDto[]> {
        const reviews = await this.prisma.review.findMany({
            where: { memberId },
            orderBy: { createdAt: "desc" },
            include: {
                game: {
                    select: {
                        title: true,
                        thumbnail: true,
                    },
                },
            },
        });

        return reviews.map((review) => ({
            id: review.id,
            gameId: review.gameId,
            content: review.content,
            rating: review.rating,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            gameTitle: review.game.title,
            imageUrl: review.game.thumbnail,
        }));
    }

    async create(memberId: string, dto: CreateReviewDto): Promise<ReviewDto> {
        const review = await this.prisma.review.create({
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
        const review = await this.prisma.review.update({
            where: { id: reviewId },
            data: {
                content: dto.content,
                rating: dto.rating,
            },
        });

        return this.toDto(review);
    }

    async findById(reviewId: number): Promise<ReviewDto | null> {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });
        return review ? this.toDto(review) : null;
    }

    async delete(reviewId: number): Promise<void> {
        await this.prisma.reviewLike.deleteMany({
            where: { reviewId },
        });

        await this.prisma.review.delete({
            where: { id: reviewId },
        });
    }

    async findAllByGameIds(
        gameIds: number[]
    ): Promise<{ gameId: number; rating: number; memberScore: number }[]> {
        const reviews = await this.prisma.review.findMany({
            where: {
                gameId: { in: gameIds },
            },
            select: {
                gameId: true,
                rating: true,
                member: {
                    select: {
                        score: true,
                    },
                },
            },
        });

        return reviews.map((review) => ({
            gameId: review.gameId,
            rating: review.rating,
            memberScore: review.member.score,
        }));
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
            score: number;
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
            score: review.member?.score ?? 0,
            imageUrl: review.member?.imageUrl ?? "/icons/arena.svg",
            likeCount: 0,
            isLiked: false,
        };
    }
}
