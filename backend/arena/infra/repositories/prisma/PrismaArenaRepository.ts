// infra/repositories/PrismaArenaRepository.ts
import {
    ArenaRepository,
    ArenaWithRelations,
    CreateArenaInput,
} from "@/backend/arena/domain/repositories/ArenaRepository";
import { Arena, Prisma, PrismaClient } from "@/prisma/generated";
import { ArenaStatus } from "@/types/arena-status";
import { ArenaFilter } from "@/backend/arena/domain/repositories/filters/ArenaFilter";
import { prisma } from "@/lib/Prisma";

const arenaRelationSelect = {
    id: true,
    nickname: true,
    imageUrl: true,
    score: true,
} as const;

export class PrismaArenaRepository implements ArenaRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    private getWhereClause(filter: ArenaFilter): Prisma.ArenaWhereInput {
        const { status, memberId } = filter;

        return {
            ...(status && {
                status,
            }),
            ...(memberId && {
                // get if eithor the member is creator of challenger
                OR: [{ creatorId: memberId }, { challengerId: memberId }],
            }),
        };
    }

    async count(filter: ArenaFilter): Promise<number> {
        const count = await this.prisma.arena.count({
            where: this.getWhereClause(filter),
        });

        return count;
    }
    async findAll(filter: ArenaFilter): Promise<ArenaWithRelations[]> {
        const { sortField, ascending, offset, limit } = filter;
        const orderBy = sortField
            ? {
                  [sortField]: ascending ? "asc" : "desc",
              }
            : undefined;

        const data = await this.prisma.arena.findMany({
            where: this.getWhereClause(filter),
            skip: offset,
            take: limit,
            orderBy,
            include: {
                creator: {
                    select: arenaRelationSelect,
                },
                challenger: {
                    select: arenaRelationSelect,
                },
            },
        });

        return data;
    }
    async findById(id: number): Promise<Arena | null> {
        const data = await this.prisma.arena.findUnique({
            where: { id },
        });

        return data;
    }
    async save(arena: CreateArenaInput): Promise<Arena> {
        const data = await this.prisma.arena.create({
            data: arena,
        });

        return data;
    }
    async update(arena: Arena): Promise<Arena> {
        const newData = await this.prisma.arena.update({
            where: { id: arena.id },
            data: arena,
        });

        return newData;
    }
    async deleteById(id: number): Promise<void> {
        await this.prisma.arena.delete({ where: { id } });
    }

    async getArenaById(arenaId: number): Promise<ArenaWithRelations> {
        const arena = await this.prisma.arena.findUnique({
            where: { id: arenaId },
            include: {
                creator: {
                    select: arenaRelationSelect,
                },
                challenger: {
                    select: arenaRelationSelect,
                },
            },
        });

        if (!arena) {
            throw new Error("Arena not found");
        }
        return arena;
    }
    async updateStatus(arenaId: number, status: ArenaStatus): Promise<void> {
        await this.prisma.arena.update({
            where: { id: arenaId },
            data: { status },
        });
    }
    async updateChallengerAndStatus(
        arenaId: number,
        challengerId: string,
        status: ArenaStatus
    ): Promise<void> {
        await this.prisma.arena.update({
            where: { id: arenaId },
            data: {
                challengerId,
                status,
            },
        });
    }
}
