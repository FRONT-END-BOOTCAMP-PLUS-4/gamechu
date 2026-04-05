import { vi } from "vitest";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";

export function createMockArenaRepository(): ArenaRepository {
    return {
        count: vi.fn(),
        findAll: vi.fn(),
        findById: vi.fn(),
        save: vi.fn(),
        update: vi.fn(),
        deleteById: vi.fn(),
        getArenaById: vi.fn(),
        updateStatus: vi.fn(),
        updateChallengerAndStatus: vi.fn(),
    };
}
