import { NextResponse } from "next/server";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { GetVoteUsecase } from "@/backend/vote/application/usecase/GetVoteUsecase";
import { GetVoteDto } from "@/backend/vote/application/usecase/dto/GetVoteDto";

type RequestParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(request: Request, { params }: RequestParams) {
    const memberId = await getAuthUserId();
    const { id } = await params;
    const arenaId: number = Number(id);
    // get query parameters from URL
    const url = new URL(request.url);
    const votedTo: string = url.searchParams.get("votedTo") ?? "";
    const mine: boolean = url.searchParams.get("mine") === "true";
    if (isNaN(arenaId)) {
        return NextResponse.json(
            { error: "유효하지 않은 투기장 ID입니다." },
            { status: 400 }
        );
    }

    try {
        const voteRepository = new PrismaVoteRepository();
        const arenaRepository = new PrismaArenaRepository();
        const getVoteUsecase = new GetVoteUsecase(
            arenaRepository,
            voteRepository
        );

        const getVoteDto: GetVoteDto = new GetVoteDto(
            { arenaId, votedTo, mine }, // votedTo는 빈 문자열로 초기화
            memberId
        );
        const result = await getVoteUsecase.execute(getVoteDto);

        return NextResponse.json(result);
    } catch (error) {
        console.error("투표 정보 조회 중 오류 발생:", error);
        return NextResponse.json(
            { error: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
