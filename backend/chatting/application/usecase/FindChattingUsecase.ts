import { Chatting } from "@/prisma/generated";
import { ChattingRepository } from "../../domain/repositories/ChattingRepository";

// 상수는 유스케이스 내부에서도 정의 가능
const MAX_SEND_COUNT = 5;

interface ExecuteParams {
    arenaId: number;
    memberId: string | null;
}

interface FindChattingResult {
    chats: Chatting[];
    remainingSends: number;
}

export class FindChattingUsecase {
    constructor(private chattingRepo: ChattingRepository) {}

    async execute(params: ExecuteParams): Promise<FindChattingResult> {
        const { arenaId, memberId } = params;

        const chats = await this.chattingRepo.findByArenaId(arenaId);

        let sentCount = 0;
        if (memberId) {
            sentCount = await this.chattingRepo.countByArenaIdAndMemberId(
                arenaId,
                memberId
            );
        }

        return {
            chats,
            remainingSends: MAX_SEND_COUNT - sentCount,
        };
    }
}
