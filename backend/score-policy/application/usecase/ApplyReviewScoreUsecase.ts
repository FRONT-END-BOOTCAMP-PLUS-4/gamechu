import { ApplyReviewScoreDto } from "./dto/ApplyReviewScoreDto";
import { ScorePolicy } from "../../domain/ScorePolicy";
import { ScoreRecordRepository } from "@/backend/score-record/domain/repositories/ScoreRecordRepository";

export class ApplyReviewScoreUsecase {
    constructor(
        private readonly scorePolicy: ScorePolicy,
        private readonly memberRepository: {
            incrementScore: (memberId: string, delta: number) => Promise<void>;
        },
        private readonly scoreRecordRepository: ScoreRecordRepository
    ) {}

    async execute({
        memberId,
        action,
        currentLikeCount = 0,
    }: ApplyReviewScoreDto): Promise<void> {
        const delta = this.scorePolicy.calculateDeltaForReview(
            action,
            currentLikeCount
        );
        const policyId = this.scorePolicy.getPolicyIdByReviewAction(action);

        await this.memberRepository.incrementScore(memberId, delta);
        await this.scoreRecordRepository.createRecord({ memberId, policyId });
    }
}
