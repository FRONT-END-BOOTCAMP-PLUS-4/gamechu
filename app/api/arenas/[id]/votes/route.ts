import { NextResponse } from "next/server";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { GetVoteUsecase } from "@/backend/vote/application/usecase/GetVoteUsecase";
import { GetVoteDto } from "@/backend/vote/application/usecase/dto/GetVoteDto";
import { IdSchema, validate } from "@/utils/Validation";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";

type RequestParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(request: Request, { params }: RequestParams) {
    const memberId = await getAuthUserId();
    const log = logger.child({
        route: "/api/arenas/[id]/votes",
        method: "GET",
    });
    const { id } = await params;

    const idValidation = validate(IdSchema, id);
    if (!idValidation.success) return idValidation.response;
    const arenaId = idValidation.data;

    // get query parameters from URL
    const url = new URL(request.url);
    const votedTo: string = url.searchParams.get("votedTo") ?? "";
    const mine: boolean = url.searchParams.get("mine") === "true";
    if (mine && !memberId) {
        return NextResponse.json({
            votes: [],
            totalCount: 0,
            message: "비로그인 상태입니다.",
        });
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
        log.error({ userId: memberId, err: error }, "투표 정보 조회 실패");
        return errorResponse("알 수 없는 오류 발생", 500);
    }
}
