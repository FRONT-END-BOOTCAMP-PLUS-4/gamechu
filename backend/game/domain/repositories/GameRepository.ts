import { GetGameCardDto } from "../../application/usecase/dto/GetGameCardDto";

export interface GameRepository {
    findFilteredGames(
        genreId?: number,
        themeId?: number,
        platformId?: number,
        keyword?: string
    ): Promise<GetGameCardDto[]>;
    findAllGames(): Promise<GetGameCardDto[]>;
}
