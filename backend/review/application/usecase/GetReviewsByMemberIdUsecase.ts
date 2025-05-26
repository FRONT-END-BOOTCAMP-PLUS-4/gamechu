import { ReviewByMembersDto } from "./dto/ReviewByMembersDto";
import { ReviewRepository } from "../../domain/repositories/ReviewRepository";

export class GetReviewsByMemberIdUsecase {
    constructor(private reviewRepository: ReviewRepository) {}

    async execute(memberId: string): Promise<ReviewByMembersDto[]> {
        return this.reviewRepository.findByMemberId(memberId);
    }
}
