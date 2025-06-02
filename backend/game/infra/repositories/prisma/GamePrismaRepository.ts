import { PrismaClient } from "@/prisma/generated";
import { GameRepository } from "@/backend/game/domain/repositories/GameRepository";
import { GetGameCardDto } from "@/backend/game/application/usecase/dto/GetGameCardDto";
import { GetGameDetailDto } from "@/backend/game/application/usecase/dto/GetGameDetailDto";
import { Prisma } from "@/prisma/generated";

const prisma = new PrismaClient();

export class GamePrismaRepository implements GameRepository {
    async findDetailById(id: number): Promise<GetGameDetailDto> {
        const [game, wishCount, reviewCount] = await Promise.all([
            prisma.game.findUnique({
                where: { id },
                include: {
                    gamePlatforms: { include: { platform: true } },
                    gameGenres: { include: { genre: true } },
                    gameThemes: { include: { theme: true } },
                },
            }),
            prisma.wishlist.count({
                where: { gameId: id },
            }),
            prisma.review.count({
                where: { gameId: id },
            }),
        ]);

        if (!game) throw new Error("게임을 찾을 수 없습니다");

        return {
            id: game.id,
            title: game.title,
            developer: game.developer ?? "알 수 없음",
            thumbnail: game.thumbnail ?? "",
            releaseDate: game.releaseDate
                ? game.releaseDate.toISOString().split("T")[0]
                : "알 수 없음",
            platforms: game.gamePlatforms.map((gp) => gp.platform.name),
            genres: game.gameGenres.map((gg) => gg.genre.name),
            themes: game.gameThemes.map((gt) => gt.theme.name),
            wishCount,
            reviewCount,
        };
    }
    async findFilteredGames(
        genreId?: number,
        themeId?: number,
        platformId?: number,
        keyword?: string,
        sort?: "latest" | "popular" | "rating",
        skip = 0,
        take = 6
    ): Promise<GetGameCardDto[]> {
        const where: Prisma.GameWhereInput = {
            ...(genreId && { gameGenres: { some: { genreId } } }),
            ...(themeId && { gameThemes: { some: { themeId } } }),
            ...(platformId && { gamePlatforms: { some: { platformId } } }),
            ...(keyword && {
                OR: [
                    { title: { contains: keyword, mode: "insensitive" } },
                    { developer: { contains: keyword, mode: "insensitive" } },
                ],
            }),
        };

        const allGames = await prisma.game.findMany({
            where,
            include: {
                gamePlatforms: { include: { platform: true }, take: 1 },
                reviews: { include: { member: true } },
            },
        });

        const mapped = allGames.map((game) => {
            const expertReviews = game.reviews.filter(
                (r) => r.member.score >= 3000
            );
            const expertRating = expertReviews.length
                ? expertReviews.reduce((sum, r) => sum + r.rating, 0) /
                  expertReviews.length /
                  2
                : 0;

            return {
                id: game.id,
                title: game.title,
                thumbnail: game.thumbnail ?? "",
                developer: game.developer ?? "알 수 없음",
                platform: game.gamePlatforms[0]?.platform.name ?? "기타",
                expertRating,
                reviewCount: game.reviews.length,
                releaseDate: game.releaseDate ?? new Date(0),
            };
        });

        if (sort === "popular") {
            mapped.sort((a, b) => b.reviewCount - a.reviewCount);
        } else if (sort === "rating") {
            mapped.sort((a, b) => b.expertRating - a.expertRating);
        } else if (sort === "latest") {
            mapped.sort((a, b) => {
                const dateA = a.releaseDate.getTime();
                const dateB = b.releaseDate.getTime();
                return dateB - dateA;
            });
        }

        // pagination (skip + take 적용)
        return mapped.slice(skip, skip + take);
    }
    async findAllGames(): Promise<GetGameCardDto[]> {
        const games = await prisma.game.findMany({
            include: {
                gamePlatforms: {
                    include: { platform: true },
                    take: 1,
                },
            },
        });

        return games.map((game) => ({
            id: game.id,
            title: game.title,
            thumbnail: game.thumbnail ?? "",
            developer: game.developer ?? "알 수 없음",
            platform: game.gamePlatforms[0]?.platform.name ?? "기타",
            expertRating: 0, // 기본값 설정, 필요시 수정 가능
            reviewCount: 0, // 기본값 설정, 필요시 수정 가능
            releaseDate: game.releaseDate ?? new Date(0),
        }));
    }
    async countFilteredGames(
        genreId?: number,
        themeId?: number,
        platformId?: number,
        keyword?: string
    ): Promise<number> {
        return prisma.game.count({
            where: {
                ...(genreId && { gameGenres: { some: { genreId } } }),
                ...(themeId && { gameThemes: { some: { themeId } } }),
                ...(platformId && { gamePlatforms: { some: { platformId } } }),
                ...(keyword && {
                    OR: [
                        { title: { contains: keyword, mode: "insensitive" } },
                        {
                            developer: {
                                contains: keyword,
                                mode: "insensitive",
                            },
                        },
                    ],
                }),
            },
        });
    }
    async getAverageRatingByExpert(gameId: number): Promise<number | null> {
        const reviews = await prisma.review.findMany({
            where: {
                gameId,
                member: { score: { gte: 3000 } },
            },
            select: { rating: true },
        });

        if (reviews.length === 0) return null;
        const avg =
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length / 2;
        return avg;
    }
}
