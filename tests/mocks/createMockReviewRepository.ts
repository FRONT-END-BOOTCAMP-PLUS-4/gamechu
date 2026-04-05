import { vi } from "vitest";
import { ReviewRepository } from "@/backend/review/domain/repositories/ReviewRepository";

export function createMockReviewRepository(): ReviewRepository {
    return {
        findByGameId: vi.fn(),
        findByMemberId: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findById: vi.fn(),
        findAllByGameIds: vi.fn(),
    };
}
