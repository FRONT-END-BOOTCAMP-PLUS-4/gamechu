// backend/chatting/domain/repositories/ChattingRepository.ts
import { Chatting } from "@/prisma/generated";
import { ChattingFilter } from "./filters/ChattingFilter";

export type CreateCahttingInput = Omit<Chatting, "id">;
export interface ChattingRepository {
    save(chatting: CreateCahttingInput): Promise<Chatting>;
    findAll(filter: ChattingFilter): Promise<Chatting[]>;
    count(filter: ChattingFilter): Promise<number>;
    deleteById(id: number): Promise<void>;
}
