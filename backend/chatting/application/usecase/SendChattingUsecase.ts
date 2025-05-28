// backend/chatting/application/usecase/SendChattingUsecase.ts
import { Chatting } from "@/prisma/generated";
import { ChattingRepository } from "../../domain/repositories/ChattingRepository";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";

// 상수 정의 (API 핸들러, 프론트와 맞춰야 함)
const MAX_MESSAGE_LENGTH = 200;
const MAX_SEND_COUNT = 5;

// execute 메소드에 필요한 인자들을 정의하는 인터페이스
interface ExecuteParams {
    arenaId: number;
    memberId: string;
    content: string;
}

export class SendChattingUsecase {
    constructor(
        private chattingRepository: ChattingRepository,
        private arenaRepository: ArenaRepository
    ) {}
    async execute(
        params: ExecuteParams
    ): Promise<{ newChat: Chatting; remainingSends: number }> {
        const { arenaId, memberId, content } = params;
        const arena = await this.arenaRepository.findById(arenaId);
        if (!arena) {
            throw new Error("존재하지 않는 아레나입니다.");
        }

        if (content.length > MAX_MESSAGE_LENGTH) {
            throw new Error(
                `메시지 길이가 너무 깁니다. (${MAX_MESSAGE_LENGTH}자 제한)`
            );
        }

        const isParticipant =
            memberId === arena.creatorId || memberId === arena.challengerId;
        if (!isParticipant) {
            throw new Error("아레나 참가자만 메시지를 보낼 수 있습니다.");
        }

        const sentCount =
            await this.chattingRepository.countByArenaIdAndMemberId(
                arenaId,
                memberId
            );
        if (sentCount >= MAX_SEND_COUNT) {
            throw new Error(
                `메시지 전송 횟수(${MAX_SEND_COUNT}번)를 모두 사용했습니다.`
            );
        }

        const savedChat = await this.chattingRepository.save({
            id: -1,
            memberId,
            arenaId,
            content,
            createdAt: new Date(),
        });

        const remainingSends = MAX_SEND_COUNT - (sentCount + 1); // 1개 보냈으므로 +1

        return {
            newChat: savedChat,
            remainingSends,
        };
    }
}
