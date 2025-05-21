import { ReviewDto } from "./dto/ReviewDto";
import { ReviewRepository } from "../../domain/repositories/ReviewRepository";

export class GetReviewsByMemberIdUsecase {
    constructor(private reviewRepository: ReviewRepository) {}

    async execute(memberId: string): Promise<ReviewDto[]> {
        return this.reviewRepository.findByMemberId(memberId);
    }
}
