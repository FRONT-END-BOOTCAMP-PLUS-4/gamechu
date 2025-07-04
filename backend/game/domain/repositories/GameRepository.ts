import { GetGameDetailDto } from "../../application/usecase/dto/GetGameDetailDto";
import { GameFilter } from "./filters/GameFilter";
import { GameCard } from "../../infra/repositories/prisma/GamePrismaRepository";

export interface GameRepository {
    findAll(filter: GameFilter): Promise<GameCard[]>;
    countAll(filter: GameFilter): Promise<number>;
    findById(id: number): Promise<GetGameDetailDto>;
    getAverageRatingByExpert(gameId: number): Promise<number | null>;
}
