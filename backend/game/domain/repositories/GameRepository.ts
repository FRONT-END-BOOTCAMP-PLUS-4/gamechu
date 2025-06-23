import { GetGameCardDto } from "../../application/usecase/dto/GetGameCardDto";
import { GetGameDetailDto } from "../../application/usecase/dto/GetGameDetailDto";
import { GameFilter } from "./filters/GameFilter";

export interface GameRepository {
    findFilteredGames(filter: GameFilter): Promise<GetGameCardDto[]>;
    countFilteredGames(filter: GameFilter): Promise<number>;
    findDetailById(id: number): Promise<GetGameDetailDto>;
    getAverageRatingByExpert(gameId: number): Promise<number | null>;
}
