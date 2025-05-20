import { GameRepository } from "@/backend/game/domain/repositories/GameRepository";
import { GetGameCardDto } from "./dto/GetGameCardDto";

export class GetGameListUsecase {
    constructor(private readonly gameRepository: GameRepository) {}

    async execute(): Promise<GetGameCardDto[]> {
        return this.gameRepository.findAllGames();
    }
}
