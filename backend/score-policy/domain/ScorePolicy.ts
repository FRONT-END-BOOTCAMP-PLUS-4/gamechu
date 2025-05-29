import { ArenaResult } from "../application/usecase/dto/ApplyArenaScoreDto";
import { ReviewScoreAction } from "../application/usecase/dto/ApplyReviewScoreDto";

export class ScorePolicy {
    calculateDeltaForArena(result: ArenaResult): number {
        switch (result) {
            case "WIN":
                return 190;
            case "DRAW":
                return 100;
            case "CANCEL":
                return 100;
            case "JOIN":
                return -100;
            default:
                return 0;
        }
    }

    getPolicyIdByArenaResult(result: ArenaResult): number {
        switch (result) {
            case "JOIN":
                return 4;
            case "WIN":
                return 5;
            case "DRAW":
                return 6;
            case "CANCEL":
                return 7;
            default:
                throw new Error("Invalid arena result");
        }
    }

    calculateDeltaForReview(
        action: ReviewScoreAction,
        currentLikeCount: number
    ): number {
        switch (action) {
            case "LIKE":
                return currentLikeCount < 20 ? 5 : 0;
            case "UNLIKE":
                return -5;
            case "DELETE":
                return -Math.min(currentLikeCount * 5, 100);
            default:
                return 0;
        }
    }

    getPolicyIdByReviewAction(action: ReviewScoreAction): number {
        switch (action) {
            case "LIKE":
                return 3;
            case "UNLIKE":
                return 8;
            case "DELETE":
                return 2; // 리뷰 삭제
            default:
                throw new Error("Invalid review score action");
        }
    }
}
