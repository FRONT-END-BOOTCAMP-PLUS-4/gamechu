import { ScoreRecordDto } from "../../application/usecase/dto/ScoreRecordDto";

export interface ScoreRecordRepository {
    getScoreRecordsByMemberId(memberId: string): Promise<ScoreRecordDto[]>;
}