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
        const newScoreRecord =
            this.scoreRecordRepository.update(updateScoreRecordDto);
        return newScoreRecord;
    }
}
