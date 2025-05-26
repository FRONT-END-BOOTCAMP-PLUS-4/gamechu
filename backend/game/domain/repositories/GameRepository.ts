import { GetGameCardDto } from "../../application/usecase/dto/GetGameCardDto";
import { GetGameDetailDto } from "../../application/usecase/dto/GetGameDetailDto";

export interface GameRepository {
    findFilteredGames(
        genreId?: number,
        themeId?: number,
        platformId?: number,
        keyword?: string
    ): Promise<GetGameCardDto[]>;
    findAllGames(): Promise<GetGameCardDto[]>;
    findDetailById(id: number): Promise<GetGameDetailDto>;
}
