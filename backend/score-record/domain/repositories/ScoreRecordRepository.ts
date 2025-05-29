import { ScoreRecordDto } from "../../application/usecase/dto/ScoreRecordDto";
import { CreateScoreRecordDto } from "../../application/usecase/dto/CreateScoreRecordDto";

export interface ScoreRecordRepository {
    getScoreRecordsByMemberId(memberId: string): Promise<ScoreRecordDto[]>;
    createRecord(data: CreateScoreRecordDto): Promise<void>;
}
