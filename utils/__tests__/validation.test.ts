import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validate, IdSchema } from "../Validation";

describe("validate()", () => {
    const TestSchema = z.object({ name: z.string().min(1, "이름 필수") });

    it("유효한 데이터 → success: true, data 반환", () => {
        const result = validate(TestSchema, { name: "홍길동" });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.name).toBe("홍길동");
    });

    it("유효하지 않은 데이터 → success: false, 400 response", async () => {
        const result = validate(TestSchema, { name: "" });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.response.status).toBe(400);
            const body = await result.response.json();
            expect(body.message).toBe("이름 필수");
        }
    });

    it("완전히 잘못된 데이터 → success: false", () => {
        const result = validate(TestSchema, null);
        expect(result.success).toBe(false);
    });
});

describe("IdSchema", () => {
    it("숫자 문자열 → 양의 정수", () => {
        expect(IdSchema.parse("42")).toBe(42);
    });

    it("0 → 실패", () => {
        expect(() => IdSchema.parse("0")).toThrow();
    });

    it("음수 → 실패", () => {
        expect(() => IdSchema.parse("-1")).toThrow();
    });

    it("문자 → 실패", () => {
        expect(() => IdSchema.parse("abc")).toThrow();
    });
});
