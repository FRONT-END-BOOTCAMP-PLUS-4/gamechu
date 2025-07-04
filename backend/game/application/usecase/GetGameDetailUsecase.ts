import { GameRepository } from "@/backend/game/domain/repositories/GameRepository";
import { GetGameDetailDto } from "./dto/GetGameDetailDto";

export class GetGameDetailUsecase {
    constructor(private readonly gameRepository: GameRepository) {}

    async execute(gameId: number): Promise<GetGameDetailDto> {
        const detail = await this.gameRepository.findById(gameId);
        if (!detail) {
            throw new Error("게임 정보를 찾을 수 없습니다.");
        }

        const rating =
            await this.gameRepository.getAverageRatingByExpert(gameId);

        return {
            ...detail,
            rating,
        };
    }
}
