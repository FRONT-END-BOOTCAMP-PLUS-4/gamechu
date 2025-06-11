// infra/repositories/PrismaArenaRepository.ts
import {
    ArenaRepository,
    CreateArenaInput,
} from "@/backend/arena/domain/repositories/ArenaRepository";
import { Arena, Prisma, PrismaClient } from "@/prisma/generated";
import { ArenaStatus } from "@/types/arena-status";
import { ArenaFilter } from "@/backend/arena/domain/repositories/filters/ArenaFilters";
import { UpdateArenaDto } from "@/backend/arena/application/usecase/dto/UpdateArenaDto";

export class PrismaArenaRepository implements ArenaRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
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
    async findAll(filter: ArenaFilter): Promise<Arena[]> {
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
    async update(updateArenaDto: UpdateArenaDto): Promise<Arena> {
        const { id, ...fields } = updateArenaDto;

        // undefined가 아닌 값만 추림
        const data: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
            if (value !== undefined) {
                data[key] = value;
            }
        }

        const newData = await this.prisma.arena.update({
            where: { id },
            data,
        });

        return newData;
    }
    async deleteById(id: number): Promise<void> {
        await this.prisma.arena.delete({ where: { id } });
    }

    async getArenaById(arenaId: number): Promise<Arena> {
        const arena = await this.prisma.arena.findUnique({
            where: { id: arenaId },
            select: {
                id: true,
                creatorId: true,
                challengerId: true,
                title: true,
                description: true,
                startDate: true,
                status: true,
            },
        });

        if (!arena) {
            throw new Error("Arena not found");
        }
        return {
            id: arena.id,
            creatorId: arena.creatorId,
            challengerId: arena?.challengerId ?? null,
            title: arena.title,
            description: arena.description,
            startDate: arena.startDate,
            status: arena.status as ArenaStatus,
        };
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
    async getList(): Promise<Arena[]> {
        const arenas = await this.prisma.arena.findMany({
            select: {
                id: true,
                creatorId: true,
                challengerId: true,
                title: true,
                description: true,
                startDate: true,
                status: true,
                creator: { select: { nickname: true } }, // creator relation 이름에 맞게 바꿔야 함
                challenger: { select: { nickname: true } }, // challenger relation 이름에 맞게 바꿔야 함
            },
        });
        return arenas.map((arena) => {
            return {
                id: arena.id,
                creatorId: arena.creatorId,
                challengerId: arena.challengerId ?? null,
                title: arena.title,
                description: arena.description,
                status: arena.status as ArenaStatus,
                startDate: arena.startDate,
            };
        });
    }
}
