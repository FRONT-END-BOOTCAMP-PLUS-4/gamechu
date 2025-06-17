import { ChattingRepository } from "../../domain/repositories/ChattingRepository";

export class DeleteChattingUsecase {
    private chattingRepository: ChattingRepository;

    constructor(chattingRepository: ChattingRepository) {
        this.chattingRepository = chattingRepository;
    }

    async execute(id: number): Promise<void> {
        await this.chattingRepository.deleteById(id);
    }
}
