import { Chatting } from "@/prisma/generated";
import { ChattingRepository } from "../../domain/repositories/ChattingRepository";
import { ChattingDto } from "./dto/ChattingDto";

export class SendChattingUsecase {
    constructor(private chattingRepository: ChattingRepository) {}

    async execute(ChattingDto: ChattingDto): Promise<Chatting> {
        const newChat = {
            id: -1,
            memberId: ChattingDto.memberId,
            arenaId: ChattingDto.arenaId,
            content: ChattingDto.content,
            createdAt: new Date(),
        };
        const savedChat = await this.chattingRepository.save(newChat);
        return savedChat;
    }
}
