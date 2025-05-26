import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { Vote, Prisma, PrismaClient } from "@/prisma/generated";
import { VoteFilter } from "@/backend/vote/domain/repositories/filters/VoteFilter";

export class PrismaVoteRepository implements VoteRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    private getWhereClause(filter: VoteFilter): Prisma.VoteWhereInput {
        const { arenaId, votedTo } = filter;

        return {
            ...(arenaId && {
                arenaId,
            }),
            ...(votedTo && {
                votedTo,
            }),
        };
    }

    async count(filter: VoteFilter): Promise<number> {
        const count = await this.prisma.vote.count({
            where: this.getWhereClause(filter),
        });

        return count;
    }
    async findAll(filter: VoteFilter): Promise<Vote[]> {
        const data = await this.prisma.vote.findMany({
            where: this.getWhereClause(filter),
        });

        return data;
    }
    async findById(id: number): Promise<Vote | null> {
        const data = await this.prisma.vote.findUnique({
            where: { id },
        });

        return data;
    }
    async save(vote: Vote): Promise<Vote> {
        const data = await this.prisma.vote.create({
            data: vote,
        });

        return data;
    }
    async update(vote: Vote): Promise<Vote> {
        const newData = await this.prisma.vote.update({
            where: { id: vote.id },
            data: vote,
        });

        return newData;
    }
    async deleteById(id: number): Promise<void> {
        await this.prisma.vote.delete({ where: { id } });
    }
}
