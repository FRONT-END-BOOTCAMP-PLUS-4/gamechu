import { describe, it, expect } from "vitest";
import { SignUpSchema } from "../SignUpRequestDto";

describe("SignUpSchema", () => {
    const valid = {
        nickname: "홍길동",
        email: "test@example.com",
        password: "password123",
        birthDate: "19900101",
        gender: "M",
    };

    it("유효한 입력 통과", () => {
        expect(SignUpSchema.safeParse(valid).success).toBe(true);
    });

    it("이메일 형식 오류 → 실패", () => {
        const r = SignUpSchema.safeParse({ ...valid, email: "not-an-email" });
        expect(r.success).toBe(false);
    });

    it("비밀번호 8자 미만 → 실패", () => {
        const r = SignUpSchema.safeParse({ ...valid, password: "short" });
        expect(r.success).toBe(false);
    });

    it("birthDate 8자리 숫자 아님 → 실패", () => {
        const r = SignUpSchema.safeParse({ ...valid, birthDate: "1990-01-01" });
        expect(r.success).toBe(false);
    });

    it("gender M/F 외 → 실패", () => {
        const r = SignUpSchema.safeParse({ ...valid, gender: "X" });
        expect(r.success).toBe(false);
    });

    it("nickname 빈 문자열 → 실패", () => {
        const r = SignUpSchema.safeParse({ ...valid, nickname: "" });
        expect(r.success).toBe(false);
    });
});
