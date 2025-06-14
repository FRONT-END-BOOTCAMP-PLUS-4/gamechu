import { ScoreRecordRepository } from "../../domain/repositories/ScoreRecordRepository";
import { UpdateScoreRecordDto } from "./dto/UpdateScoreRecordDto";
import { ScoreRecord } from "@/prisma/generated";

export class UpdateScoreRecordUsecase {
    private scoreRecordRepository: ScoreRecordRepository;

    constructor(scoreRecordRepository: ScoreRecordRepository) {
        this.scoreRecordRepository = scoreRecordRepository;
    }

    async execute(
        updateScoreRecordDto: UpdateScoreRecordDto
    ): Promise<ScoreRecord> {
        const scoreRecord = await this.scoreRecordRepository.findById(
            updateScoreRecordDto.id
        );

        if (!scoreRecord) {
            throw new Error("Score record not found");
        }

        if (updateScoreRecordDto.memberId) {
            scoreRecord.memberId = updateScoreRecordDto.memberId;
        }
        if (updateScoreRecordDto.policyId) {
            scoreRecord.policyId = updateScoreRecordDto.policyId;
        }
        if (updateScoreRecordDto.actualScore) {
            scoreRecord.actualScore = updateScoreRecordDto.actualScore;
        }

        const newScoreRecord = this.scoreRecordRepository.update(scoreRecord);
        return newScoreRecord;
    }
}
