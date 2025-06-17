import { ChattingRepository } from "../../domain/repositories/ChattingRepository";
import { Chatting } from "@/prisma/generated";
import { UpdateChattingDto } from "./dto/UpdateChattingDto";

export class UpdateChattingUsecase {
    private chattingRepository: ChattingRepository;

    constructor(chattingRepository: ChattingRepository) {
        this.chattingRepository = chattingRepository;
    }

    async execute(updateChattingDto: UpdateChattingDto): Promise<Chatting> {
        const chatting = await this.chattingRepository.findById(
            updateChattingDto.id
        );
        if (!chatting) {
            throw new Error("Chatting not found");
        }

        if (updateChattingDto.content !== undefined) {
            chatting.content = updateChattingDto.content;
        }

        const updatedChatting = await this.chattingRepository.update(chatting);
        return updatedChatting;
    }
}
