import { PrismaClient } from "@/prisma/generated";
import { GameRepository } from "@/backend/game/domain/repositories/GameRepository";
import { GetGameCardDto } from "@/backend/game/application/usecase/dto/GetGameCardDto";

const prisma = new PrismaClient();

export class GamePrismaRepository implements GameRepository {
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
            },
        });

        return games.map((game) => ({
            id: game.id,
            title: game.title,
            thumbnail: game.thumbnail ?? "",
            developer: game.developer ?? "알 수 없음",
            platform: game.gamePlatforms[0]?.platform.name ?? "기타",
        }));
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
        }));
    }
}
