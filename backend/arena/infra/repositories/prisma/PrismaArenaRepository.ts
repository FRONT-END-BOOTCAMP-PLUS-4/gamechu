// infra/repositories/PrismaArenaRepository.ts
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaClient } from "@/prisma/generated";
import { ArenaStatus } from "@/types/arena-status";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import dayjs from "dayjs";

export class PrismaArenaRepository implements ArenaRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }
    async getArenaById(arenaId: number): Promise<ArenaDetailDto> {
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
        const challenger = arena.challengerId
            ? await this.prisma.member.findUnique({
                  where: { id: arena.challengerId },
                  select: { nickname: true },
              })
            : null;

        const startDateObj = dayjs(arena.startDate); // DB Date 객체를 dayjs 객체로 만듦
        const endChattingObj = startDateObj.add(30, "minute"); // 30분 더함
        const endVoteObj = endChattingObj.add(24, "hour");
        return {
            id: arena.id,
            creatorId: arena.creatorId,
            creatorName: creator.nickname,
            challengerId: arena?.challengerId ?? null,
            challengerName: challenger?.nickname ?? null,
            title: arena.title,
            description: arena.description,
            startDate: dayjs(arena.startDate).format("YYYY-MM-DD HH:mm:ss"),
            endChatting: endChattingObj.format("YYYY-MM-DD HH:mm:ss"),
            endVote: endVoteObj.format("YYYY-MM-DD HH:mm:ss"),
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
    async getList(): Promise<ArenaDetailDto[]> {
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
            const startDateObj = dayjs(arena.startDate);
            const endChatting = startDateObj
                .add(30, "minute")
                .format("YYYY-MM-DD HH:mm:ss");
            const endVote = startDateObj
                .add(30, "minute")
                .add(24, "hour")
                .format("YYYY-MM-DD HH:mm:ss");
            return {
                id: arena.id,
                creatorId: arena.creatorId,
                creatorName: arena.creator?.nickname ?? "",
                challengerId: arena.challengerId ?? null,
                challengerName: arena.challenger?.nickname ?? null,
                title: arena.title,
                description: arena.description,
                status: arena.status as ArenaStatus,
                startDate: arena.startDate.toISOString(),
                endChatting,
                endVote,
            };
        });
    }
}
