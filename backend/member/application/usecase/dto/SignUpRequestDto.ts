import { z } from "zod";

export const SignUpSchema = z.object({
    nickname: z
        .string()
        .min(1, "닉네임을 입력해주세요.")
        .max(20, "닉네임은 20자 이하여야 합니다."),
    email: z.string().email("올바른 이메일 형식이 아닙니다."),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
    birthDate: z
        .string()
        .regex(/^\d{8}$/, "생년월일은 yyyymmdd 형식이어야 합니다."),
    gender: z.enum(["M", "F"], { error: "성별은 M 또는 F여야 합니다." }),
});

export class SignUpRequestDto {
    constructor(
        public readonly nickname: string,
        public readonly email: string,
        public readonly password: string,
        public readonly birthDate: string, // YYYYMMDD
        public readonly gender: "M" | "F"
    ) {}
}
