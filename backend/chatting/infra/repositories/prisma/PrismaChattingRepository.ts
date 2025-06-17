// backend/chatting/infra/repositories/prisma/PrismaChattingRepository.ts
import {
    ChattingRepository,
    CreateCahttingInput,
} from "@/backend/chatting/domain/repositories/ChattingRepository";
import { ChattingFilter } from "@/backend/chatting/domain/repositories/filters/ChattingFilter";

import { Chatting, Prisma, PrismaClient } from "@/prisma/generated";

export class PrismaChattingRepository implements ChattingRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }
    private getWhereClause(filter: ChattingFilter): Prisma.ChattingWhereInput {
        const { arenaId, memberId } = filter;

        return {
            ...(arenaId !== undefined && { arenaId }),
            ...(memberId !== undefined && memberId !== null && { memberId }),
        };
    }

    async count(filter: ChattingFilter): Promise<number> {
        const count = await this.prisma.chatting.count({
            where: this.getWhereClause(filter),
        });
        return count;
    }

    async findAll(filter: ChattingFilter): Promise<Chatting[]> {
        const data = await this.prisma.chatting.findMany({
            where: this.getWhereClause(filter),
            orderBy: { createdAt: "asc" },
        });
        return data;
    }
    async findById(id: number): Promise<Chatting | null> {
        const data = await this.prisma.chatting.findUnique({
            where: { id },
        });
        return data;
    }

    async save(chatting: CreateCahttingInput): Promise<Chatting> {
        const data = await this.prisma.chatting.create({
            data: chatting,
        });
        return data;
    }

    async update(chatting: Chatting): Promise<Chatting> {
        const newData = await this.prisma.chatting.update({
            where: { id: chatting.id },
            data: chatting,
        });
        return newData;
    }

    async deleteById(id: number): Promise<void> {
        await this.prisma.chatting.delete({ where: { id } });
    }
}
