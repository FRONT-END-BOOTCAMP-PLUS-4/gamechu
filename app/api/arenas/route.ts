import { ArenaListDto } from "@/backend/arena/application/usecase/dto/ArenaListDto";
import { GetArenaDto, GetArenaSchema } from "@/backend/arena/application/usecase/dto/GetArenaDto";
import { GetArenaUsecase } from "@/backend/arena/application/usecase/GetArenaUsecase";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { validate } from "@/utils/validation";
import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { withCache } from "@/lib/withCache";
import { ARENA_LIST_VERSION_KEY, arenaListKey } from "@/lib/cacheKey";

export async function GET(request: Request) {
    try {
        const memberId = await getAuthUserId();

        const url = new URL(request.url);
        const validated = validate(GetArenaSchema, Object.fromEntries(url.searchParams));
        if (!validated.success) return validated.response;

        const { currentPage, status, mine, pageSize, memberId: targetMemberId } = validated.data;

        if (!memberId && mine) {
            return NextResponse.json(
                { message: "멤버 투기장 조회 권한이 없습니다." },
                { status: 401 }
            );
        }

        let effectiveMemberId: string | undefined;
        if (targetMemberId) {
            effectiveMemberId = targetMemberId;
        } else if (mine && memberId) {
            effectiveMemberId = memberId;
        } else {
            effectiveMemberId = undefined;
        }

        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const memberRepository: MemberRepository = new PrismaMemberRepository();
        const voteRepository: VoteRepository = new PrismaVoteRepository();

        const getArenaUsecase = new GetArenaUsecase(
            arenaRepository,
            memberRepository,
            voteRepository
        );

        const getArenaDto = new GetArenaDto(
            {
                currentPage,
                status,
                mine: false,
                targetMemberId: effectiveMemberId,
            },
            memberId,
            pageSize
        );

        const version = (await redis.get(ARENA_LIST_VERSION_KEY)) ?? "0";
        const key = arenaListKey(version, {
            currentPage,
            status,
            targetMemberId: effectiveMemberId,
            pageSize,
        });

        const arenaListDto: ArenaListDto = await withCache(key, 60, () =>
            getArenaUsecase.execute(getArenaDto)
        );

        return NextResponse.json(arenaListDto);
    } catch (error: unknown) {
        console.error("Error fetching arenas:", error);

        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "투기장 조회 실패" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
