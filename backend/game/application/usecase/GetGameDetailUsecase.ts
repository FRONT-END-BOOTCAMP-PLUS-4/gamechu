import { GameRepository } from "@/backend/game/domain/repositories/GameRepository";
import { GetGameDetailDto } from "./dto/GetGameDetailDto";

export class GetGameDetailUsecase {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(gameId: number): Promise<GetGameDetailDto> {
    return this.gameRepository.findDetailById(gameId);
  }
}