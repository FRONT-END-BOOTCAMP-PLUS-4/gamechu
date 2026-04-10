import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { CreateVoteUsecase } from "@/backend/vote/application/usecase/CreateVoteUsecase";
import { SubmitVoteDto } from "@/backend/vote/application/usecase/dto/SubmitVoteDto";
import { SubmitVoteSchema } from "@/backend/vote/application/usecase/dto/SubmitVoteDto";
import { UpdateVoteUsecase } from "@/backend/vote/application/usecase/UpdateVoteUsecase";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { validate } from "@/utils/Validation";
import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";

export async function POST(req: NextRequest) {
    const log = logger.child({
        route: "/api/member/arenas/[id]/votes",
        method: "POST",
    });
    try {
        const memberId = await getAuthUserId();

        if (!memberId) {
            return errorResponse("로그인이 필요합니다.", 401);
        }

        const body = await req.json();

        const bodyValidation = validate(SubmitVoteSchema, body);
        if (!bodyValidation.success) return bodyValidation.response;

        const { arenaId, votedTo } = bodyValidation.data;
        const submitVoteDto: SubmitVoteDto = { arenaId, memberId, votedTo };

        const voteRepository = new PrismaVoteRepository();
        const arenaRepository = new PrismaArenaRepository();
        const createVoteUsecase = new CreateVoteUsecase(
            voteRepository,
            arenaRepository
        );

        const result = await createVoteUsecase.execute(submitVoteDto);
        return NextResponse.json(result, { status: 201 });
    } catch (error: unknown) {
        log.error({ err: error }, "투표 생성 실패");
        const message = error instanceof Error ? error.message : "서버 오류";
        return errorResponse(message, 500);
    }
}

export async function PATCH(req: NextRequest) {
    const log = logger.child({
        route: "/api/member/arenas/[id]/votes",
        method: "PATCH",
    });
    try {
        //TODO: Patch나 Delete의 경우 우선 해당 데이터가 존재하는지 확인하고, 없을 경우 에러를 출력하는 로직을 먼저 넣어주세요.
        const memberId = await getAuthUserId();

        if (!memberId) {
            return errorResponse("로그인이 필요합니다.", 401);
        }

        const body = await req.json();

        const bodyValidation = validate(SubmitVoteSchema, body);
        if (!bodyValidation.success) return bodyValidation.response;

        const { arenaId, votedTo } = bodyValidation.data;
        const submitVoteDto: SubmitVoteDto = { arenaId, memberId, votedTo };

        const voteRepository = new PrismaVoteRepository();
        const updateVoteUsecase = new UpdateVoteUsecase(voteRepository);

        const result = await updateVoteUsecase.execute(submitVoteDto);
        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        log.error({ err: error }, "투표 수정 실패");
        const message = error instanceof Error ? error.message : "서버 오류";
        return errorResponse(message, 500);
    }
}
