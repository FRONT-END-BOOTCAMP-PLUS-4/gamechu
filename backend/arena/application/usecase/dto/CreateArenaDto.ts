import { z } from "zod";

export const CreateArenaSchema = z.object({
    title: z
        .string()
        .min(1, "제목을 입력해주세요.")
        .max(100, "제목은 100자 이하여야 합니다."),
    description: z
        .string()
        .min(1, "설명을 입력해주세요.")
        .max(500, "설명은 500자 이하여야 합니다."),
    startDate: z.string().datetime("올바른 날짜 형식이 아닙니다."),
});

export class CreateArenaDto {
    constructor(
        public creatorId: string,
        public title: string,
        public description: string,
        public startDate: Date
    ) {}
}
