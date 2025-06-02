import { PrismaClient } from "@/prisma/generated";
import { GameRepository } from "@/backend/game/domain/repositories/GameRepository";
import { GetGameCardDto } from "@/backend/game/application/usecase/dto/GetGameCardDto";
import { GetGameDetailDto } from "@/backend/game/application/usecase/dto/GetGameDetailDto";

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
        keyword?: string
    ): Promise<GetGameCardDto[]> {
        const games = await prisma.game.findMany({
            where: {
                ...(genreId && {
                    gameGenres: { some: { genreId } },
                }),
                ...(themeId && {
                    gameThemes: { some: { themeId } },
                }),
                ...(platformId && {
                    gamePlatforms: { some: { platformId } },
                }),
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
            include: {
                gamePlatforms: {
                    include: { platform: true },
                    take: 1,
                },
                reviews: {
                    include: { member: true },
                },
            },
        });

        return games.map((game) => {
            const expertReviews = game.reviews.filter(
                (r) => r.member.score >= 3000
            );
            const expertRating = expertReviews.length
                ? expertReviews.reduce((acc, r) => acc + r.rating, 0) /
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
            };
        });
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
        }));
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
