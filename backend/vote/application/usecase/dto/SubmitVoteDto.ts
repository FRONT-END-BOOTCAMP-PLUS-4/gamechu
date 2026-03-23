import { z } from "zod";

export const SubmitVoteSchema = z.object({
    arenaId: z.number().int().positive("유효하지 않은 투기장 ID입니다."),
    votedTo: z.string().min(1, "투표 대상을 선택해주세요."),
});

export class SubmitVoteDto {
    constructor(
        public arenaId: number,
        public memberId: string,
        public votedTo: string
    ) {}
}
