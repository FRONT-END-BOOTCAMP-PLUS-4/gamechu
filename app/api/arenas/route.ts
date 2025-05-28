import { CreateArenaUsecase } from "@/backend/arena/application/usecase/CreateArenaUsecase";
import { ArenaListDto } from "@/backend/arena/application/usecase/dto/ArenaListDto";
import { CreateArenaDto } from "@/backend/arena/application/usecase/dto/CreateArenaDto";
import { GetArenaDto } from "@/backend/arena/application/usecase/dto/GetArenaDto";
import { GetArenaUsecase } from "@/backend/arena/application/usecase/GetArenaUsecase";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { ErrorHandling } from "@/utils/ErrorHandling";
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
        const mine: boolean = Boolean(url.searchParams.get("mine"));
        const pageSize: number = Number(request.headers.get("pageSize")!);

        if (!memberId && mine) {
            return NextResponse.json(
                { error: "투기장 조회 권한이 없습니다." },
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
    } catch (error) {
        console.error(`Error fetching arenas: ${error}`);
        return NextResponse.json(
            { error: "Failed to fetch arenas" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // body validation
        const body = await request.json();
        if (!body.title) {
            return NextResponse.json(
                { error: "투기장 제목을 찾을 수 없습니다." },
                { status: 400 }
            );
        }

        if (!body.description) {
            return NextResponse.json(
                { error: "투기장 내용을 찾을 수 없습니다." },
                { status: 400 }
            );
        }

        // member validation
        const memberId = await getAuthUserId();
        if (!memberId) {
            return NextResponse.json(
                { error: "투기장 작성 권한이 없습니다." },
                { status: 401 }
            );
        }

        // execute usecase
        const createArenaDto = new CreateArenaDto(
            memberId!,
            body.title,
            body.description,
            new Date()
        );
        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const createArenaUsecase = new CreateArenaUsecase(arenaRepository);
        const newArena = await createArenaUsecase.execute(createArenaDto);
        return NextResponse.json(newArena, { status: 201 });
    } catch (error) {
        console.error(`Error fetching arenas: ${error}`);
        return NextResponse.json(
            { error: "Failed to fetch arenas" },
            { status: 500 }
        );
    }
}
