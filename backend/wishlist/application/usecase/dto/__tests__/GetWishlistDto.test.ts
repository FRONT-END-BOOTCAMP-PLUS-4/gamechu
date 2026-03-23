import { describe, it, expect } from "vitest";
import { WishlistBodySchema } from "../GetWishlistDto";

describe("WishlistBodySchema", () => {
    it("양의 정수 gameId 통과", () => {
        expect(WishlistBodySchema.safeParse({ gameId: 5 }).success).toBe(true);
    });
    it("gameId 0 → 실패", () => {
        expect(WishlistBodySchema.safeParse({ gameId: 0 }).success).toBe(false);
    });
    it("gameId 없음 → 실패", () => {
        expect(WishlistBodySchema.safeParse({}).success).toBe(false);
    });
});
