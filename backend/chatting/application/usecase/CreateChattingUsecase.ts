// backend/chatting/application/usecase/SendChattingUsecase.ts
import { Chatting } from "@/prisma/generated";
import {
    ChattingRepository,
    CreateChattingInput,
} from "../../domain/repositories/ChattingRepository";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ChattingFilter } from "../../domain/repositories/filters/ChattingFilter";
import { CreateChattingDto } from "./dto/CreateChattingDto";

// 상수 정의 (API 핸들러, 프론트와 맞춰야 함)
const MAX_MESSAGE_LENGTH = 200;
const MAX_SEND_COUNT = 5;

export class CreateChattingUsecase {
    constructor(
        private chattingRepository: ChattingRepository,
        private arenaRepository: ArenaRepository
    ) {}
    async execute(createChattingDto: CreateChattingDto): Promise<Chatting> {
        try {
            const { arenaId, memberId, content } = createChattingDto;
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
            const filter = new ChattingFilter(arenaId, memberId);
            const sentCount = await this.chattingRepository.count(filter);
            if (sentCount >= MAX_SEND_COUNT) {
                throw new Error(
                    `메시지 전송 횟수(${MAX_SEND_COUNT}번)를 모두 사용했습니다.`
                );
            }
            const chatting: CreateChattingInput = {
                memberId,
                arenaId,
                content,
                createdAt: new Date(),
            };
            const newChatting = await this.chattingRepository.save(chatting);

            return newChatting;
        } catch (error) {
            console.error("Error creating chat message", error);
            throw new Error("Error creating chat message");
        }
    }
}
