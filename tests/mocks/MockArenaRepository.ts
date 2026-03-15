import { vi } from "vitest";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";

export const MockArenaRepository = (): ArenaRepository => ({
    count: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    deleteById: vi.fn(),
    getArenaById: vi.fn(),
    updateStatus: vi.fn(),
    updateChallengerAndStatus: vi.fn(),
});
