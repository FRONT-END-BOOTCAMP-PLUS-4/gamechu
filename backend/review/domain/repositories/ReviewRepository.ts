import { ReviewDto } from "../../application/usecase/dto/ReviewDto";
import { CreateReviewDto } from "../../application/usecase/dto/CreateReviewDto";
import { UpdateReviewDto } from "../../application/usecase/dto/UpdateReviewDto";
import { ReviewByMembersDto } from "../../application/usecase/dto/ReviewByMembersDto";

export interface ReviewRepository {
    findByGameId(gameId: number): Promise<ReviewDto[]>;
    findByMemberId(memberId: string): Promise<ReviewByMembersDto[]>;
    create(memberId: string, dto: CreateReviewDto): Promise<ReviewDto>;
    update(reviewId: number, dto: UpdateReviewDto): Promise<ReviewDto>;
    delete(reviewId: number): Promise<void>;
    findById(reviewId: number): Promise<ReviewDto | null>;
    findAllByGameIds(
        gameIds: number[]
    ): Promise<{ gameId: number; rating: number; memberScore: number }[]>;
}
