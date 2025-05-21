import { ReviewDto } from "../../application/usecase/dto/ReviewDto";
import { CreateReviewDto } from "../../application/usecase/dto/CreateReviewDto";
import { UpdateReviewDto } from "../../application/usecase/dto/UpdateReviewDto";

export interface ReviewRepository {
    findByGameId(gameId: number): Promise<ReviewDto[]>;
    findByMemberId(memberId: string): Promise<ReviewDto[]>;
    create(memberId: string, dto: CreateReviewDto): Promise<ReviewDto>;
    update(reviewId: number, dto: UpdateReviewDto): Promise<ReviewDto>;
    delete(reviewId: number): Promise<void>;
    findById(reviewId: number): Promise<ReviewDto | null>;
}
