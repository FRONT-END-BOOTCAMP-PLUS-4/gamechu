import { describe, it, expect } from "vitest";
import { CreateReviewSchema } from "../CreateReviewDto";

describe("CreateReviewSchema", () => {
    const valid = { content: "재미있어요", rating: 4 };

    it("유효한 입력 통과", () => {
        expect(CreateReviewSchema.safeParse(valid).success).toBe(true);
    });

    it("content 빈 문자열 → 실패", () => {
        expect(
            CreateReviewSchema.safeParse({ ...valid, content: "" }).success
        ).toBe(false);
    });

    it("rating 0 → 실패", () => {
        expect(
            CreateReviewSchema.safeParse({ ...valid, rating: 0 }).success
        ).toBe(false);
    });

    it("rating 6 → 실패", () => {
        expect(
            CreateReviewSchema.safeParse({ ...valid, rating: 6 }).success
        ).toBe(false);
    });

    it("rating 소수점 → 실패", () => {
        expect(
            CreateReviewSchema.safeParse({ ...valid, rating: 3.5 }).success
        ).toBe(false);
    });
});
