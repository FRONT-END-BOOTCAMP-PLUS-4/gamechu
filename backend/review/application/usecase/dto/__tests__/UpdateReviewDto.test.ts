import { describe, it, expect } from "vitest";
import { UpdateReviewSchema } from "../UpdateReviewDto";

describe("UpdateReviewSchema", () => {
    it("content만 있어도 통과", () => {
        expect(
            UpdateReviewSchema.safeParse({ content: "수정된 내용" }).success
        ).toBe(true);
    });

    it("rating만 있어도 통과", () => {
        expect(UpdateReviewSchema.safeParse({ rating: 3 }).success).toBe(true);
    });

    it("빈 객체 → 실패 (최소 1개 필드 필요)", () => {
        expect(UpdateReviewSchema.safeParse({}).success).toBe(false);
    });

    it("rating 범위 초과 → 실패", () => {
        expect(UpdateReviewSchema.safeParse({ rating: 6 }).success).toBe(false);
    });
});
