// infra/repositories/PrismaArenaRepository.ts
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaParticipantsDto } from "@/backend/arena/application/usecase/dto/ArenaParticipantsDto";
import { PrismaClient } from "@/prisma/generated";
import { ArenaStatus } from "@/types/arena-status";

export class PrismaArenaRepository implements ArenaRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }
    async getArenaById(arenaId: number): Promise<any> {
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
        const creator = await this.prisma.member.findUnique({
            where: { id: arena.creatorId },
            select: { nickname: true },
        });

        if (!creator) {
            throw new Error("Creator not found");
        }
        const challenger = await this.prisma.member.findUnique({
            where: { id: arena.challengerId },
            select: { nickname: true },
        });
        if (!challenger) {
            throw new Error("Challenger not found");
        }
        return {
            id: arena.id,
            creatorName: creator.nickname,
            challengerName: challenger?.nickname,
            title: arena.title,
            description: arena.description,
            startDate: arena.startDate,
            status: arena.status,
        };
    }
    async getParticipants(arenaId: number): Promise<ArenaParticipantsDto> {
        const arena = await this.prisma.arena.findUnique({
            where: { id: arenaId },
            select: {
                creatorId: true,
                challengerId: true,
            },
        });

        if (!arena) {
            throw new Error("Arena not found");
        }

        return new ArenaParticipantsDto(arena.creatorId, arena.challengerId);
    }
    async updateStatus(arenaId: number, status: ArenaStatus): Promise<void> {
        await this.prisma.arena.update({
            where: { id: arenaId },
            data: { status },
        });
    }
}
