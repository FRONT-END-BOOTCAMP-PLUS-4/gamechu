export interface ReviewLikeRepository {
    like(reviewId: number, memberId: string): Promise<void>;
    unlike(reviewId: number, memberId: string): Promise<void>;
    exists(reviewId: number, memberId: string): Promise<boolean>;
    countLikes(reviewId: number): Promise<number>;
}
