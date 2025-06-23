import { GameRepository } from "@/backend/game/domain/repositories/GameRepository";
import { GameFilter } from "@/backend/game/domain/repositories/filters/GameFilter";
import { GetGameCardDto } from "./dto/GetGameCardDto";

export class GetFilteredGamesUsecase {
    constructor(private readonly gameRepository: GameRepository) {}

    async execute(query: {
        genre?: string;
        theme?: string;
        platform?: string;
        keyword?: string;
        sort?: "latest" | "popular" | "rating";
        page?: string;
        size?: string;
    }): Promise<{ data: GetGameCardDto[]; totalCount: number }> {
        const filter = new GameFilter(query);

        const data = await this.gameRepository.findFilteredGames(filter);
        const totalCount = await this.gameRepository.countFilteredGames(filter);

        return { data, totalCount };
    }
}
