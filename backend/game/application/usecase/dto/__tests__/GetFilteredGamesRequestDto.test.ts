import { describe, it, expect } from "vitest";
import { GetFilteredGamesSchema } from "../GetFilteredGamesRequestDto";

describe("GetFilteredGamesSchema", () => {
    it("빈 객체 → 기본값 적용", () => {
        const r = GetFilteredGamesSchema.safeParse({});
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.sort).toBe("popular");
            expect(r.data.page).toBe(1);
            expect(r.data.size).toBe(6);
        }
    });

    it("sort=latest 통과", () => {
        expect(GetFilteredGamesSchema.safeParse({ sort: "latest" }).success).toBe(true);
    });

    it("sort=invalid → 실패", () => {
        expect(GetFilteredGamesSchema.safeParse({ sort: "newest" }).success).toBe(false);
    });

    it("genreId 문자열 숫자 → 숫자 변환", () => {
        const r = GetFilteredGamesSchema.safeParse({ genreId: "5" });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.genreId).toBe(5);
    });

    it("keyword 있으면 통과", () => {
        expect(GetFilteredGamesSchema.safeParse({ keyword: "zelda" }).success).toBe(true);
    });
});
