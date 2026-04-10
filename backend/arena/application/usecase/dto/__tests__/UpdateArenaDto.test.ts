import { describe, it, expect } from "vitest";
import { UpdateArenaSchema, UpdateArenaAdminSchema } from "../UpdateArenaDto";

describe("UpdateArenaSchema", () => {
    it("description만 있어도 통과", () => {
        expect(
            UpdateArenaSchema.safeParse({ description: "수정된 설명" }).success
        ).toBe(true);
    });

    it("빈 객체 → 실패 (최소 1개 필드)", () => {
        expect(UpdateArenaSchema.safeParse({}).success).toBe(false);
    });

    it("description 빈 문자열 → 실패", () => {
        expect(UpdateArenaSchema.safeParse({ description: "" }).success).toBe(
            false
        );
    });
});

describe("UpdateArenaAdminSchema", () => {
    it("status만 있어도 통과", () => {
        expect(UpdateArenaAdminSchema.safeParse({ status: 2 }).success).toBe(
            true
        );
    });

    it("빈 객체 → 실패", () => {
        expect(UpdateArenaAdminSchema.safeParse({}).success).toBe(false);
    });
});
