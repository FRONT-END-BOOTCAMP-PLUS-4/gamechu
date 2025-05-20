import { GameRepository } from "@/backend/game/domain/repositories/GameRepository";
import { GetGameCardDto } from "./dto/GetGameCardDto";
import { GetGamesByFilterRequestDto } from "./dto/GetGamesByFilterDto";

export class GetFilteredGamesUsecase {
    constructor(private readonly gameRepository: GameRepository) {}

    async execute(
        filters: GetGamesByFilterRequestDto
    ): Promise<GetGameCardDto[]> {
        const { genre, theme, platform, keyword } = filters;
        const genreId = genre ? parseInt(genre, 10) : undefined;
        const themeId = theme ? parseInt(theme, 10) : undefined;
        const platformId = platform ? parseInt(platform, 10) : undefined;

        return this.gameRepository.findFilteredGames(
            genreId,
            themeId,
            platformId,
            keyword
        );
    }
}
