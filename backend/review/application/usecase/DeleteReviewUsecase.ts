import { ReviewRepository } from "../../domain/repositories/ReviewRepository";

export class DeleteReviewUsecase {
    constructor(private reviewRepository: ReviewRepository) {}

    async execute(reviewId: number): Promise<void> {
        return  this.reviewRepository.delete(reviewId);
    }
}
