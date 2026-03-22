import { z } from "zod";

export const UpdateProfileSchema = z.object({
    nickname:  z.string().min(1, "닉네임을 입력해주세요.").max(20, "닉네임은 20자 이하여야 합니다.").optional(),
    isMale:    z.boolean().optional(),
    birthDate: z.string().regex(/^\d{8}$/, "날짜는 yyyymmdd 형식이어야 합니다.").optional(),
    imageUrl:  z.string().url("올바른 URL 형식이 아닙니다.").optional(),
}).refine(
    data => Object.values(data).some(v => v !== undefined),
    { message: "수정할 내용을 입력해주세요." }
);

export class UpdateProfileRequestDto {
    memberId: string;
    nickname?: string;
    isMale?: boolean;
    birthDate?: string; // "yyyymmdd"
    imageUrl?: string;

    constructor(props: {
        memberId: string;
        nickname?: string;
        isMale?: boolean;
        birthDate?: string;
        imageUrl?: string;
    }) {
        this.memberId = props.memberId;
        this.nickname = props.nickname;
        this.isMale = props.isMale;
        this.birthDate = props.birthDate;
        this.imageUrl = props.imageUrl;
    }
}
