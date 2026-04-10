import { describe, it, expect } from "vitest";
import { CreateChattingSchema } from "../CreateChattingDto";

describe("CreateChattingSchema", () => {
    it("유효한 입력 통과", () => {
        expect(
            CreateChattingSchema.safeParse({ content: "안녕하세요" }).success
        ).toBe(true);
    });

    it("빈 content → 실패", () => {
        expect(CreateChattingSchema.safeParse({ content: "" }).success).toBe(
            false
        );
    });

    it("200자 초과 → 실패", () => {
        expect(
            CreateChattingSchema.safeParse({ content: "a".repeat(201) }).success
        ).toBe(false);
    });

    it("200자 정확히 → 통과", () => {
        expect(
            CreateChattingSchema.safeParse({ content: "a".repeat(200) }).success
        ).toBe(true);
    });
});
