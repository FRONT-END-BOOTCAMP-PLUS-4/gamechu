import { Chatting } from "@/prisma/generated";
import { ChattingRepository } from "../../domain/repositories/ChattingRepository";
import { ChattingFilter } from "../../domain/repositories/filters/ChattingFilter";

// 상수는 유스케이스 내부에서도 정의 가능
const MAX_SEND_COUNT = 5;

interface ExecuteParams {
    arenaId: number;
    memberId: string | null;
}

interface GetChattingResult {
    chats: Chatting[];
    remainingSends: number;
}

export class GetChattingUsecase {
    constructor(private chattingRepo: ChattingRepository) {}

    async execute(params: ExecuteParams): Promise<GetChattingResult> {
        const { arenaId, memberId } = params;
        const filter = new ChattingFilter(arenaId, memberId);
        const chats = await this.chattingRepo.findAll(filter);

        let sentCount = 0;
        if (memberId) {
            sentCount = await this.chattingRepo.count(filter);
        }

        return {
            chats,
            remainingSends: MAX_SEND_COUNT - sentCount,
        };
    }
}
