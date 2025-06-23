import { PrismaClient, Prisma } from "@/prisma/generated";
import { GameRepository } from "@/backend/game/domain/repositories/GameRepository";
import { GetGameCardDto } from "@/backend/game/application/usecase/dto/GetGameCardDto";
import { GetGameDetailDto } from "@/backend/game/application/usecase/dto/GetGameDetailDto";
import { GameFilter } from "@/backend/game/domain/repositories/filters/GameFilter";

export class GamePrismaRepository implements GameRepository {
    private prisma = new PrismaClient();

    private getWhereClause(filter: GameFilter): Prisma.GameWhereInput {
        const { genreId, themeId, platformId, keyword } = filter;

        return {
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
    }

    async countFilteredGames(filter: GameFilter): Promise<number> {
        return this.prisma.game.count({
            where: this.getWhereClause(filter),
        });
    }

    async findFilteredGames(filter: GameFilter): Promise<GetGameCardDto[]> {
        const { offset, limit, sort } = filter;
        const where = this.getWhereClause(filter);
        const safeDate = (date?: Date | null) =>
            date instanceof Date ? date : new Date(0);

        // 최신순 정렬은 Prisma가 처리
        if (sort === "latest") {
            const games = await this.prisma.game.findMany({
                where: {
                    ...where,
                    releaseDate: { not: null },
                },
                skip: offset,
                take: limit,
                orderBy: { releaseDate: "desc" },
                include: {
                    gamePlatforms: { include: { platform: true }, take: 1 },
                    reviews: { include: { member: true } },
                },
            });

            return games.map((game) => {
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
        }

        // Prisma 정렬 불가 → 전부 fetch 후 JS 정렬
        const allGames = await this.prisma.game.findMany({
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
                releaseDate: safeDate(game.releaseDate),
            };
        });

        if (sort === "popular") {
            mapped.sort((a, b) => b.reviewCount - a.reviewCount);
        } else if (sort === "rating") {
            mapped.sort((a, b) => b.expertRating - a.expertRating);
        }

        return mapped.slice(offset, offset + limit);
    }

    async findDetailById(id: number): Promise<GetGameDetailDto> {
        const [game, wishCount, reviewCount] = await Promise.all([
            this.prisma.game.findUnique({
                where: { id },
                include: {
                    gamePlatforms: { include: { platform: true } },
                    gameGenres: { include: { genre: true } },
                    gameThemes: { include: { theme: true } },
                },
            }),
            this.prisma.wishlist.count({ where: { gameId: id } }),
            this.prisma.review.count({ where: { gameId: id } }),
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

    async getAverageRatingByExpert(gameId: number): Promise<number | null> {
        const reviews = await this.prisma.review.findMany({
            where: {
                gameId,
                member: { score: { gte: 3000 } },
            },
            select: { rating: true },
        });

        if (reviews.length === 0) return null;
        return (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length / 2
        );
    }
}
