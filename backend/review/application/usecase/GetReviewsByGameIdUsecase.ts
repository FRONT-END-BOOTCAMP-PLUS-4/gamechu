import { ReviewDto } from "./dto/ReviewDto";
import { ReviewRepository } from "../../domain/repositories/ReviewRepository";

export class GetReviewsByGameIdUsecase {
    constructor(private reviewRepository: ReviewRepository) {}

    async execute(gameId: number): Promise<ReviewDto[]> {
        return this.reviewRepository.findByGameId(gameId);
    }
}
