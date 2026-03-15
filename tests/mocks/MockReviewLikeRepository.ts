import { vi } from "vitest";
import { ReviewLikeRepository } from "@/backend/review-like/domain/repositories/ReviewLikeRepository";

export const MockReviewLikeRepository = (): ReviewLikeRepository => ({
    like: vi.fn(),
    unlike: vi.fn(),
    isLiked: vi.fn(),
    count: vi.fn(),
});
