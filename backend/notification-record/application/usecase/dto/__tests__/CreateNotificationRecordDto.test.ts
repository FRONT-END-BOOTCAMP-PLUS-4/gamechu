import { describe, it, expect } from "vitest";
import { CreateNotificationRecordSchema } from "../CreateNotificationRecordDto";

describe("CreateNotificationRecordSchema", () => {
    const valid = { memberId: "user-1", typeId: 1, description: "알림 내용" };
    it("유효한 입력 통과", () => {
        expect(CreateNotificationRecordSchema.safeParse(valid).success).toBe(
            true
        );
    });
    it("memberId 빈 문자열 → 실패", () => {
        expect(
            CreateNotificationRecordSchema.safeParse({ ...valid, memberId: "" })
                .success
        ).toBe(false);
    });
    it("typeId 0 → 실패", () => {
        expect(
            CreateNotificationRecordSchema.safeParse({ ...valid, typeId: 0 })
                .success
        ).toBe(false);
    });
});
