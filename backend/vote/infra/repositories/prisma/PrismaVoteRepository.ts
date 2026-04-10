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
        // RAW SQL 쿼리로 한 번에 모든 arena의 vote count 계산
        const results = await this.prisma.$queryRaw<
            Array<{
                arenaId: number;
                totalCount: bigint;
                leftCount: bigint;
                rightCount: bigint;
            }>
        >`
            SELECT
                v.arena_id::INTEGER AS "arenaId",
                COUNT(*)::INTEGER AS "totalCount",
                SUM(CASE WHEN v.voted_to = a.creator_id THEN 1 ELSE 0 END)::INTEGER AS "leftCount",
                SUM(CASE WHEN v.voted_to != a.creator_id THEN 1 ELSE 0 END)::INTEGER AS "rightCount"
            FROM votes v
            JOIN arenas a ON v.arena_id = a.id
            WHERE v.arena_id IN (${Prisma.join(arenaIds)})
            GROUP BY v.arena_id
        `;

        return results.map((row) => ({
            arenaId: row.arenaId,
            totalCount: Number(row.totalCount),
            leftCount: Number(row.leftCount),
            rightCount: Number(row.rightCount),
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
