import { PrismaClient, Prisma } from "@/prisma/generated";
import { GameRepository } from "@/backend/game/domain/repositories/GameRepository";
import { Game, Platform } from "@/prisma/generated";
import { GetGameDetailDto } from "@/backend/game/application/usecase/dto/GetGameDetailDto";
import { GameFilter } from "@/backend/game/domain/repositories/filters/GameFilter";

export type GameCard = Game & {
    gamePlatforms: {
        platform: Platform;
    }[];
};

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

    async countAll(filter: GameFilter): Promise<number> {
        return this.prisma.game.count({
            where: this.getWhereClause(filter),
        });
    }

    async findAll(filter: GameFilter): Promise<GameCard[]> {
        const { sort, offset, limit } = filter;

        const where = this.getWhereClause(filter);

        const orderBy =
            sort === "latest"
                ? { releaseDate: Prisma.SortOrder.desc }
                : undefined;

        if (sort === "latest") {
            where.releaseDate = { not: null };
        }

        return this.prisma.game.findMany({
            where,
            orderBy,
            skip: sort === "latest" ? offset : undefined,
            take: sort === "latest" ? limit : undefined,
            include: {
                gamePlatforms: {
                    include: { platform: true },
                    take: 1,
                },
            },
        });
    }

    async findById(id: number): Promise<GetGameDetailDto> {
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
