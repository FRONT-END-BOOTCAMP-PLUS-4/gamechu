import { vi } from "vitest";
import { ReviewLikeRepository } from "@/backend/review-like/domain/repositories/ReviewLikeRepository";

export function createMockReviewLikeRepository(): ReviewLikeRepository {
    return {
        like: vi.fn(),
        unlike: vi.fn(),
        isLiked: vi.fn(),
        count: vi.fn(),
        countByReviewIds: vi.fn(),
        isLikedByReviewIds: vi.fn(),
    };
}
