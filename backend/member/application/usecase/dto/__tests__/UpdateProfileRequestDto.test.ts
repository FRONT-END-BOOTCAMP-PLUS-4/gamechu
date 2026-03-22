import { describe, it, expect } from "vitest";
import { UpdateProfileSchema } from "../UpdateProfileRequestDto";

describe("UpdateProfileSchema", () => {
    it("nickname만 있어도 통과", () => {
        expect(UpdateProfileSchema.safeParse({ nickname: "새닉네임" }).success).toBe(true);
    });

    it("빈 객체 → 실패 (최소 1개 필드)", () => {
        expect(UpdateProfileSchema.safeParse({}).success).toBe(false);
    });

    it("nickname 빈 문자열 → 실패", () => {
        expect(UpdateProfileSchema.safeParse({ nickname: "" }).success).toBe(false);
    });

    it("birthDate yyyymmdd 형식 통과", () => {
        expect(UpdateProfileSchema.safeParse({ birthDate: "19900101" }).success).toBe(true);
    });

    it("birthDate ISO 형식 → 실패", () => {
        expect(UpdateProfileSchema.safeParse({ birthDate: "1990-01-01" }).success).toBe(false);
    });

    it("imageUrl 유효한 URL 통과", () => {
        expect(UpdateProfileSchema.safeParse({ imageUrl: "https://example.com/img.png" }).success).toBe(true);
    });

    it("imageUrl 잘못된 URL → 실패", () => {
        expect(UpdateProfileSchema.safeParse({ imageUrl: "not-a-url" }).success).toBe(false);
    });
});
