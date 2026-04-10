import { describe, it, expect } from "vitest";
import { CreateArenaSchema } from "../CreateArenaDto";

describe("CreateArenaSchema", () => {
    const valid = {
        title: "테스트 투기장",
        description: "설명입니다",
        startDate: "2026-04-01T00:00:00.000Z",
    };

    it("유효한 입력 통과", () => {
        expect(CreateArenaSchema.safeParse(valid).success).toBe(true);
    });

    it("제목 빈 문자열 → 실패", () => {
        expect(
            CreateArenaSchema.safeParse({ ...valid, title: "" }).success
        ).toBe(false);
    });

    it("제목 100자 초과 → 실패", () => {
        expect(
            CreateArenaSchema.safeParse({ ...valid, title: "a".repeat(101) })
                .success
        ).toBe(false);
    });

    it("설명 500자 초과 → 실패", () => {
        expect(
            CreateArenaSchema.safeParse({
                ...valid,
                description: "a".repeat(501),
            }).success
        ).toBe(false);
    });

    it("잘못된 날짜 형식 → 실패", () => {
        expect(
            CreateArenaSchema.safeParse({ ...valid, startDate: "2026-04-01" })
                .success
        ).toBe(false);
    });
});
