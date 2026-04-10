import { describe, it, expect } from "vitest";
import { GetNotificationRecordSchema } from "../GetNotificationRecordDto";

describe("GetNotificationRecordSchema", () => {
    it("빈 객체 → 기본값 1", () => {
        const r = GetNotificationRecordSchema.safeParse({});
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.currentPage).toBe(1);
    });
    it("currentPage=0 → 실패", () => {
        expect(
            GetNotificationRecordSchema.safeParse({ currentPage: "0" }).success
        ).toBe(false);
    });
});
