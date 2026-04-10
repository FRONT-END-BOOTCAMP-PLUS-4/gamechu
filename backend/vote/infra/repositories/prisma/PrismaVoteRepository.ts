import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { Vote, Prisma, PrismaClient } from "@/prisma/generated";
import { VoteFilter } from "@/backend/vote/domain/repositories/filters/VoteFilter";
import { prisma } from "@/lib/Prisma";

type VoteWithoutId = Omit<Vote, "id">;
export class PrismaVoteRepository implements VoteRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    private getWhereClause(filter: VoteFilter): Prisma.VoteWhereInput {
        const { arenaId, memberId, votedTo } = filter;

        return {
            ...(arenaId && {
                arenaId,
            }),

            ...(memberId && {
                memberId,
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

    async countByArenaIds(arenaIds: number[]): Promise<
        Array<{
            arenaId: number;
            totalCount: number;
            leftCount: number;
            rightCount: number;
        }>
    > {
        const votes = await this.prisma.vote.findMany({
            where: { arenaId: { in: arenaIds } },
            select: {
                arenaId: true,
                votedTo: true,
                arena: { select: { creatorId: true } },
            },
        });

        const statsMap = new Map<
            number,
            { totalCount: number; leftCount: number; rightCount: number }
        >();

        for (const vote of votes) {
            const existing = statsMap.get(vote.arenaId) ?? {
                totalCount: 0,
                leftCount: 0,
                rightCount: 0,
            };
            existing.totalCount++;
            if (vote.votedTo === vote.arena.creatorId) {
                existing.leftCount++;
            } else {
                existing.rightCount++;
            }
            statsMap.set(vote.arenaId, existing);
        }

        return Array.from(statsMap.entries()).map(([arenaId, counts]) => ({
            arenaId,
            ...counts,
        }));
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
    async save(vote: VoteWithoutId): Promise<Vote> {
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
