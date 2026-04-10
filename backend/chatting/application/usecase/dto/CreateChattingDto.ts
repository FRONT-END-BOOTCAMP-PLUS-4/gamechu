import { z } from "zod";

export const CreateChattingSchema = z.object({
    content: z
        .string()
        .min(1, "메시지를 입력해주세요.")
        .max(200, "메시지는 200자 이하여야 합니다."),
});

export class CreateChattingDto {
    constructor(
        public arenaId: number,
        public memberId: string,
        public content: string
    ) {}
}
