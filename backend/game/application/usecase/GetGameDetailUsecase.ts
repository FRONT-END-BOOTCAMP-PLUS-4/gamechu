import { GameRepository } from "@/backend/game/domain/repositories/GameRepository";
import { ReviewRepository } from "@/backend/review/domain/repositories/ReviewRepository";
import { GetGameDetailDto } from "./dto/GetGameDetailDto";

export class GetGameDetailUsecase {
    constructor(
        private readonly gameRepository: GameRepository,
        private readonly reviewRepository: ReviewRepository
    ) {}

    async execute(gameId: number): Promise<GetGameDetailDto> {
        const detail = await this.gameRepository.findById(gameId);
        if (!detail) {
            throw new Error("게임 정보를 찾을 수 없습니다.");
        }

<<<<<<< HEAD
        const rating =
            await this.gameRepository.getAverageRatingByExpert(gameId);
=======
        const reviews = await this.reviewRepository.findByGameId(gameId);
        const expertReviews = reviews.filter((r) => r.score >= 3000);

        const rating =
            expertReviews.length === 0
                ? null
                : expertReviews.reduce((sum, r) => sum + r.rating, 0) /
                  expertReviews.length /
                  2;
>>>>>>> 73c5c50 ([refactor/#185] textEditor 및 자잘한 수정)

        return {
            ...detail,
            rating,
        };
    }
}
