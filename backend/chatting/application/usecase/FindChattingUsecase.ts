import { Chatting } from "@/prisma/generated";
import { ChattingRepository } from "../../domain/repositories/ChattingRepository";

export class FindChattingUsecase {
    constructor(private arenaChattingRepo: ChattingRepository) {}

    execute(arenaId: number): Promise<Chatting[]> {
        return this.arenaChattingRepo.findByArenaId(arenaId);
    }
}
