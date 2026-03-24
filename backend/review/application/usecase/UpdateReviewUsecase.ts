import { UpdateReviewDto } from "./dto/UpdateReviewDto";
import { ReviewDto } from "./dto/ReviewDto";
import { ReviewRepository } from "../../domain/repositories/ReviewRepository";
import { validateReviewContent } from "./validateReviewContent";

export class UpdateReviewUsecase {
    constructor(private readonly reviewRepository: ReviewRepository) {}

    async execute(reviewId: number, dto: UpdateReviewDto): Promise<ReviewDto> {
        if (dto.content !== undefined) validateReviewContent(dto.content);
        return this.reviewRepository.update(reviewId, dto);
    }
}
