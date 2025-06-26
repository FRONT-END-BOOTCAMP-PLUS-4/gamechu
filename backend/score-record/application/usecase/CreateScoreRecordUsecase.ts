import { ScoreRecord } from "@/prisma/generated";
import {
    ScoreRecordRepository,
    CreateScoreRecordInput,
} from "../../domain/repositories/ScoreRecordRepository";
import { CreateScoreRecordDto } from "./dto/CreateScoreRecordDto";

export class CreateScoreRecordUsecase {
    private scoreRecordRepository: ScoreRecordRepository;

    constructor(scoreRecordRepository: ScoreRecordRepository) {
        this.scoreRecordRepository = scoreRecordRepository;
    }

    async execute(
        createScoreRecordDto: CreateScoreRecordDto
    ): Promise<ScoreRecord> {
        const scoreRecord: CreateScoreRecordInput = {
            memberId: createScoreRecordDto.memberId,
            policyId: createScoreRecordDto.policyId,
            createdAt: new Date(),
            actualScore: createScoreRecordDto.actualScore,
        };

        const newScoreRecord =
            await this.scoreRecordRepository.save(scoreRecord);

        return newScoreRecord;
    }
}
