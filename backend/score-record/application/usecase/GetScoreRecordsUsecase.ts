import { ScoreRecordRepository } from "../../domain/repositories/ScoreRecordRepository";
import { ScoreRecordDto } from "./dto/ScoreRecordDto";

export class GetScoreRecordsUsecase {
    constructor(private readonly scoreRecordRepo: ScoreRecordRepository) {}

    async execute(memberId: string): Promise<ScoreRecordDto[]> {
        return this.scoreRecordRepo.getScoreRecordsByMemberId(memberId);
    }
}