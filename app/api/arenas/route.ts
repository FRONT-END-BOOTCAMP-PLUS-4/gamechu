import { ArenaListDto } from "@/backend/arena/application/usecase/dto/ArenaListDto";
import { GetArenaDto } from "@/backend/arena/application/usecase/dto/GetArenaDto";
import { GetArenaUsecase } from "@/backend/arena/application/usecase/GetArenaUsecase";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const memberId = await getAuthUserId();

        // get query parameters from URL
        const url = new URL(request.url);
        const currentPage: number = Number(
            url.searchParams.get("currentPage") || 1
        );
        const status: number = Number(url.searchParams.get("status"));
        const mine: boolean = Boolean(url.searchParams.get("mine") === "true");
        const pageSize: number = Number(url.searchParams.get("pageSize")!);

        if (!memberId && mine) {
            return NextResponse.json(
                { error: "멤버 투기장 조회 권한이 없습니다." },
                { status: 401 }
            );
        }

        // set up repositories and usecases
        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const memberRepository: MemberRepository = new PrismaMemberRepository();
        const voteRepository: VoteRepository = new PrismaVoteRepository();

        const getArenaUsecase = new GetArenaUsecase(
            arenaRepository,
            memberRepository,
            voteRepository
        );

        // set up query DTO
        const getArenaDto: GetArenaDto = new GetArenaDto(
            { currentPage, status, mine },
            memberId,
            pageSize
        );

        const arenaListDto: ArenaListDto = await getArenaUsecase.execute(
            getArenaDto
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
