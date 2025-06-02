import { GetGameCardDto } from "../../application/usecase/dto/GetGameCardDto";
import { GetGameDetailDto } from "../../application/usecase/dto/GetGameDetailDto";

export interface GameRepository {
    findFilteredGames(
        genreId?: number,
        themeId?: number,
        platformId?: number,
        keyword?: string,
        sort?: "latest" | "popular" | "rating",
        skip?: number,
        take?: number
    ): Promise<GetGameCardDto[]>;
    findAllGames(): Promise<GetGameCardDto[]>;
    findDetailById(id: number): Promise<GetGameDetailDto>;
    getAverageRatingByExpert(gameId: number): Promise<number | null>;
    countFilteredGames(
        genreId?: number,
        themeId?: number,
        platformId?: number,
        keyword?: string
    ): Promise<number>;
}
