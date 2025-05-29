import { PrismaClient } from "@/prisma/generated";
import { ReviewRepository } from "@/backend/review/domain/repositories/ReviewRepository";
import { CreateReviewDto } from "@/backend/review/application/usecase/dto/CreateReviewDto";
import { UpdateReviewDto } from "@/backend/review/application/usecase/dto/UpdateReviewDto";
import { ReviewDto } from "@/backend/review/application/usecase/dto/ReviewDto";
import { ReviewByMembersDto } from "@/backend/review/application/usecase/dto/ReviewByMembersDto";

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
                        score: true,
                    },
                },
            },

            orderBy: { createdAt: "desc" },
        });
        return reviews.map(this.toDto);
    }

    async findByMemberId(memberId: string): Promise<ReviewByMembersDto[]> {
        const reviews = await prisma.review.findMany({
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
        try {
            await prisma.reviewLike.deleteMany({
                where: { reviewId },
            });

            await prisma.review.delete({
                where: { id: reviewId },
            });
        } catch (err) {
            console.error("🔥 삭제 중 오류 발생:", err);
            throw err; // 이거 없으면 route.ts에서도 500 에러 못 잡음
        }
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

            imageUrl: review.member?.imageUrl?.startsWith("http")
                ? review.member.imageUrl
                : "/icons/arena.svg",
            likeCount: 0, // Default value or fetch from database if available
            isLiked: false, // Default value or calculate based on user context
        };
    }
}
