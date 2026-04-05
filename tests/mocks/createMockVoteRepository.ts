import { vi } from "vitest";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";

export function createMockVoteRepository(): VoteRepository {
    return {
        count: vi.fn(),
        countByArenaIds: vi.fn(),
        findAll: vi.fn(),
        findById: vi.fn(),
        save: vi.fn(),
        update: vi.fn(),
        deleteById: vi.fn(),
    };
}
