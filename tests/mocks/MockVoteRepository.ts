import { vi } from "vitest";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";

export const MockVoteRepository = (): VoteRepository => ({
    count: vi.fn(),
    countByArenaIds: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    deleteById: vi.fn(),
});
