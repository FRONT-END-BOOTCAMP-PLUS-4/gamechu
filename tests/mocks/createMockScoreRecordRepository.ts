import { vi } from "vitest";
import { ScoreRecordRepository } from "@/backend/score-record/domain/repositories/ScoreRecordRepository";

export function createMockScoreRecordRepository(): ScoreRecordRepository {
    return {
        count: vi.fn(),
        findAll: vi.fn(),
        findById: vi.fn(),
        save: vi.fn(),
        update: vi.fn(),
        deleteById: vi.fn(),
        getScoreRecordsByMemberId: vi.fn(),
        createRecord: vi.fn(),
    };
}
