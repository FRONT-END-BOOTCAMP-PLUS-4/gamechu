// backend/chatting/domain/repositories/ChattingRepository.ts
import { Chatting } from "@/prisma/generated";
import { ChattingFilter } from "./filters/ChattingFilter";

export type CreateCahttingInput = Omit<Chatting, "id">;
export interface ChattingRepository {
    count(filter: ChattingFilter): Promise<number>;
    findAll(filter: ChattingFilter): Promise<Chatting[]>;
    findById(id: number): Promise<Chatting | null>;
    save(chatting: CreateCahttingInput): Promise<Chatting>;
    update(chatting: Chatting): Promise<Chatting>;
    deleteById(id: number): Promise<void>;
}
