import { UpdateReviewDto } from "./dto/UpdateReviewDto";
import { ReviewDto } from "./dto/ReviewDto";
import { ReviewRepository } from "../../domain/repositories/ReviewRepository";

export class UpdateReviewUsecase {
    constructor(private readonly reviewRepository: ReviewRepository) {}

    async execute(reviewId: number, dto: UpdateReviewDto): Promise<ReviewDto> {
        return this.reviewRepository.update(reviewId, dto);
    }
}
