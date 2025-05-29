import { ApplyArenaScoreDto } from "./dto/ApplyArenaScoreDto";
import { ScorePolicy } from "../../domain/ScorePolicy";
import { ScoreRecordRepository } from "@/backend/score-record/domain/repositories/ScoreRecordRepository";

export class ApplyArenaScoreUsecase {
    constructor(
        private readonly scorePolicy: ScorePolicy,
        private readonly memberRepository: {
            incrementScore: (memberId: string, delta: number) => Promise<void>;
        },
        private readonly scoreRecordRepository: ScoreRecordRepository
    ) {}

    async execute({ memberId, result }: ApplyArenaScoreDto): Promise<void> {
        const delta = this.scorePolicy.calculateDeltaForArena(result);
        const policyId = this.scorePolicy.getPolicyIdByArenaResult(result);

        await this.memberRepository.incrementScore(memberId, delta);
        await this.scoreRecordRepository.createRecord({ memberId, policyId });
    }
}
