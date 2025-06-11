import { ScoreRecordDto } from "../../application/usecase/dto/ScoreRecordDto";
import { CreateScoreRecordDto } from "../../application/usecase/dto/CreateScoreRecordDto";

import { ScoreRecord } from "@/prisma/generated";
import { ScoreRecordFilter } from "./filters/ScoreRecordFilter";
import { UpdateScoreRecordDto } from "../../application/usecase/dto/UpdateScoreRecordDto";

export type CreateScoreRecordInput = Omit<ScoreRecord, "id">;

export interface ScoreRecordRepository {
    count(filter: ScoreRecordFilter): Promise<number>;
    findAll(filter: ScoreRecordFilter): Promise<ScoreRecord[]>;
    findById(id: number): Promise<ScoreRecord | null>;
    save(scoreRecord: CreateScoreRecordInput): Promise<ScoreRecord>;
    update(updateScoreRecordDto: UpdateScoreRecordDto): Promise<ScoreRecord>;
    deleteById(id: number): Promise<void>;

    // TODO: eliminate deprecated function usages
    getScoreRecordsByMemberId(memberId: string): Promise<ScoreRecordDto[]>;
    createRecord(data: CreateScoreRecordDto): Promise<void>;
}
