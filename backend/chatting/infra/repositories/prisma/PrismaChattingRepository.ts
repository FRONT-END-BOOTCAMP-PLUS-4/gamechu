import { ChattingRepository } from "@/backend/chatting/domain/repositories/ChattingRepository";
import { Chatting, PrismaClient } from "@/prisma/generated";

export class PrismaChattingRepository implements ChattingRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async save(chatting: Chatting): Promise<Chatting> {
        console.log("chatting: ", chatting);
        return this.prisma.chatting.create({
            data: {
                memberId: chatting.memberId,
                arenaId: chatting.arenaId,
                content: chatting.content,
                createdAt: chatting.createdAt,
            },
        });
    }
    async findByArenaId(arenaId: number): Promise<Chatting[]> {
        const chat = await this.prisma.chatting.findMany({
            where: {
                arenaId: arenaId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        return chat;
        console.log("chat: ", chat);
    }
}
