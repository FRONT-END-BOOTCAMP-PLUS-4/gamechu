import { GameRepository } from "@/backend/game/domain/repositories/GameRepository";
import { GetGameCardDto } from "./dto/GetGameCardDto";
import { GetGamesByFilterRequestDto } from "./dto/GetGamesByFilterDto";

export class GetFilteredGamesUsecase {
    constructor(private readonly gameRepository: GameRepository) {}

    async execute(
        filters: GetGamesByFilterRequestDto
    ): Promise<{ data: GetGameCardDto[]; totalCount: number }> {
        const {
            genre,
            theme,
            platform,
            keyword,
            sort,
            page = "1",
            size = "6",
        } = filters;

        const genreId = genre ? parseInt(genre, 10) : undefined;
        const themeId = theme ? parseInt(theme, 10) : undefined;
        const platformId = platform ? parseInt(platform, 10) : undefined;

        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(size, 10);
        const skip = (pageNumber - 1) * pageSize;
        const take = pageSize;
        const data = await this.gameRepository.findFilteredGames(
            genreId,
            themeId,
            platformId,
            keyword,
            sort,
            skip,
            take
        );
        const totalCount = await this.gameRepository.countFilteredGames(
            genreId,
            themeId,
            platformId,
            keyword
        );

        return { data, totalCount };
    }
}
