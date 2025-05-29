export type ReviewScoreAction = "LIKE" | "UNLIKE" | "DELETE";

export interface ApplyReviewScoreDto {
    memberId: string;
    action: ReviewScoreAction;
    currentLikeCount?: number; // DELETE or LIKE 시 필요
}
