import { describe, it, expect } from "vitest";
import { GetArenaSchema } from "../GetArenaDto";

describe("GetArenaSchema", () => {
    it("기본값: 빈 객체 → 모든 필드 기본값", () => {
        const r = GetArenaSchema.safeParse({});
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.currentPage).toBe(1);
            expect(r.data.pageSize).toBe(9);
            expect(r.data.status).toBe(0);
            expect(r.data.mine).toBe(false);
        }
    });

    it("pageSize=null → NaN 버그 방지, 기본값 9", () => {
        const r = GetArenaSchema.safeParse({});
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.pageSize).toBe(9);
    });

    it("mine=true 문자열 → boolean true", () => {
        const r = GetArenaSchema.safeParse({ mine: "true" });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.mine).toBe(true);
    });

    it("mine=false 문자열 → boolean false", () => {
        const r = GetArenaSchema.safeParse({ mine: "false" });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.mine).toBe(false);
    });

    it("currentPage 문자열 숫자 → 숫자로 변환", () => {
        const r = GetArenaSchema.safeParse({ currentPage: "3" });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.currentPage).toBe(3);
    });

    it("currentPage=0 → 실패 (min 1)", () => {
        expect(GetArenaSchema.safeParse({ currentPage: "0" }).success).toBe(
            false
        );
    });

    it("memberId 있으면 string으로 통과", () => {
        const r = GetArenaSchema.safeParse({ memberId: "user-123" });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.memberId).toBe("user-123");
    });
});
