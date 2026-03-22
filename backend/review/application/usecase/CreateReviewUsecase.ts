import { ReviewRepository } from "../../domain/repositories/ReviewRepository";
import { CreateReviewDto } from "./dto/CreateReviewDto";
import { ReviewDto } from "./dto/ReviewDto";
import { validateReviewContent } from "./validateReviewContent";

export class CreateReviewUsecase {
    constructor(private readonly reviewRepository: ReviewRepository) {}

    async execute(memberId: string, dto: CreateReviewDto): Promise<ReviewDto> {
        validateReviewContent(dto.content);

        const existing = await this.reviewRepository.findByMemberId(memberId);
        const hasAlreadyReviewed = existing.some(
            (review) => review.gameId === dto.gameId
        );

        if (hasAlreadyReviewed) {
            throw new Error("이미 이 게임에 대한 리뷰를 작성했습니다.");
        }

        return await this.reviewRepository.create(memberId, dto);
    }
}
