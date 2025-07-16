export interface ReviewLikeRepository {
    like(reviewId: number, memberId: string): Promise<void>;
    unlike(reviewId: number, memberId: string): Promise<void>;
    isLiked(reviewId: number, memberId: string): Promise<boolean>;
    count(reviewId: number): Promise<number>;
}
