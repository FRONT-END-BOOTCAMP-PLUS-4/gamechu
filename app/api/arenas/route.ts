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
        const memberId = await getAuthUserId(); // 로그인 유저

        // get query parameters from URL
        const url = new URL(request.url);
        const currentPage: number = Number(
            url.searchParams.get("currentPage") || 1
        );
        const status: number = Number(url.searchParams.get("status"));
        const mine: boolean = url.searchParams.get("mine") === "true";
        const pageSize: number = Number(url.searchParams.get("pageSize")!);

        // ✅ 추가: 타 사용자 ID
        const targetMemberId = url.searchParams.get("memberId");

        let effectiveMemberId: string | undefined;

        // 1️⃣ 타 사용자 조회가 최우선
        if (targetMemberId) {
            effectiveMemberId = targetMemberId;
        }
        // 2️⃣ 그게 없고, mine=true + 로그인 상태면 내 ID
        else if (mine && memberId) {
            effectiveMemberId = memberId;
        }
        // 3️⃣ 나머지는 전체 조회
        else {
            effectiveMemberId = undefined;
        }

        // 기존 권한 체크 유지
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

        const getArenaDto = new GetArenaDto(
            {
                currentPage,
                status,
                mine: false, // 🔥 이제 mine 의미 없음 (필터링은 memberId로만)
                targetMemberId: effectiveMemberId,
            },
            memberId,
            pageSize
        );

        const arenaListDto: ArenaListDto =
            await getArenaUsecase.execute(getArenaDto);

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
