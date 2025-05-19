import { Chatting } from "@/prisma/generated";

export interface ChattingRepository {
    // findById(id: number): Promise<Chatting | null>;
    save(chatting: Chatting): Promise<Chatting>;
    findByArenaId(arenaId: number): Promise<Chatting[]>;
}
