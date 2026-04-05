import { DeleteArenaUsecase } from "@/backend/arena/application/usecase/DeleteArenaUsecase";
import { GetArenaDetailDto } from "@/backend/arena/application/usecase/dto/GetArenaDetailDto";
import { UpdateArenaDetailDto } from "@/backend/arena/application/usecase/dto/UpdateArenaDetailDto";
import { UpdateArenaAdminSchema } from "@/backend/arena/application/usecase/dto/UpdateArenaDto";
import { EndArenaUsecase } from "@/backend/arena/application/usecase/EndArenaUsecase";
import { GetArenaDetailUsecase } from "@/backend/arena/application/usecase/GetArenaDetailUsecase";
import { UpdateArenaStatusUsecase } from "@/backend/arena/application/usecase/UpdateArenaStatusUsecase";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { ApplyArenaScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { Arena } from "@/prisma/generated";
import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/Redis";
import { withCache } from "@/lib/WithCache";
import { arenaDetailKey, ARENA_LIST_VERSION_KEY } from "@/lib/CacheKey";
import { validate, IdSchema } from "@/utils/Validation";
import type { ArenaStatus } from "@/types/arena-status";
import { errorResponse } from "@/utils/ApiResponse";
import logger from "@/lib/Logger";

type RequestParams = {
    params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RequestParams) {
    const { id } = await params;
    const idValidated = validate(IdSchema, id);
    if (!idValidated.success) return idValidated.response;
    const arenaId = idValidated.data;

    const arenaRepository = new PrismaArenaRepository();
    const memberRepository = new PrismaMemberRepository();
    const voteRepository = new PrismaVoteRepository();
    const getArenaDetailusecase = new GetArenaDetailUsecase(
        arenaRepository,
        memberRepository,
        voteRepository
    );
    const getArenaDetailDto = new GetArenaDetailDto(arenaId);
    try {
        const result = await withCache(
            arenaDetailKey(arenaId),
            120,
            () => getArenaDetailusecase.execute(getArenaDetailDto)
        );
        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        if (
            error instanceof Error &&
            error.message.includes("Arena not found")
        ) {
            return errorResponse("투기장이 존재하지 않습니다.", 404);
        }
        return errorResponse(`Failed to fetch participants: ${error}`, 500);
    }
}

export async function PATCH(req: NextRequest, { params }: RequestParams) {
    const log = logger.child({ route: "/api/arenas/[id]", method: "PATCH" });
    const { id } = await params;
    const idValidated = validate(IdSchema, id);
    if (!idValidated.success) return idValidated.response;
    const arenaId = idValidated.data;

    const body = await req.json();
    const validated = validate(UpdateArenaAdminSchema, body);
    if (!validated.success) return validated.response;

    const { status, challengerId } = validated.data;

    const scorePolicy = new ScorePolicy();
    const memberRepository = new PrismaMemberRepository();
    const scoreRecordRepository = new PrismaScoreRecordRepository();
    const applyArenaScoreUsecase = new ApplyArenaScoreUsecase(
        scorePolicy,
        memberRepository,
        scoreRecordRepository
    );
    const arenaRepository = new PrismaArenaRepository();
    const voteRepository = new PrismaVoteRepository();
    const updateArenaStatusUsecase = new UpdateArenaStatusUsecase(
        arenaRepository,
        applyArenaScoreUsecase
    );
    const endArenaUsecase = new EndArenaUsecase(
        arenaRepository,
        applyArenaScoreUsecase,
        voteRepository
    );

    const updateArenaDetailDto = new UpdateArenaDetailDto(
        arenaId,
        status as ArenaStatus,
        challengerId
    );
    try {
        if (status === 2) {
            if (!challengerId) {
                return errorResponse("참여자 정보를 찾을 수 없습니다.", 400);
            }

            const challenger = await memberRepository.findById(challengerId);
            if (!challenger) {
                return errorResponse("회원 정보를 찾을 수 없습니다.", 404);
            }

            if (challenger.score < 100) {
                return errorResponse("투기장 참여를 위해서는 최소 100점 이상의 점수가 필요합니다.", 403);
            }
        }

        await updateArenaStatusUsecase.execute(updateArenaDetailDto);
        if (status === 5) {
            await endArenaUsecase.execute(arenaId);
        }

        await redis.del(arenaDetailKey(arenaId));
        await redis.incr(ARENA_LIST_VERSION_KEY);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        log.error({ err: error }, "아레나 수정 실패");
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "투기장 수정 실패" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: RequestParams) {
    const log = logger.child({ route: "/api/arenas/[id]", method: "DELETE" });
    try {
        const { id } = await params;
        const idValidated = validate(IdSchema, id);
        if (!idValidated.success) return idValidated.response;
        const arenaId = idValidated.data;

        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const voteRepository = new PrismaVoteRepository();
        const scorePolicy = new ScorePolicy();
        const memberRepository = new PrismaMemberRepository();
        const scoreRecordRepository = new PrismaScoreRecordRepository();
        const applyArenaScoreUsecase = new ApplyArenaScoreUsecase(
            scorePolicy,
            memberRepository,
            scoreRecordRepository
        );

        const endArenaUsecase = new EndArenaUsecase(
            arenaRepository,
            applyArenaScoreUsecase,
            voteRepository
        );

        const deleteArenaUsecase: DeleteArenaUsecase = new DeleteArenaUsecase(
            arenaRepository
        );

        const arena: Arena | null = await arenaRepository.findById(arenaId);

        if (!arena) {
            return errorResponse("투기장이 존재하지 않습니다.", 404);
        }

        await endArenaUsecase.execute(arenaId);
        await deleteArenaUsecase.execute(arenaId);

        await redis.del(arenaDetailKey(arenaId));
        await redis.incr(ARENA_LIST_VERSION_KEY);

        return NextResponse.json(
            { message: "투기장 삭제 성공" },
            { status: 200 }
        );
    } catch (error: unknown) {
        log.error({ err: error }, "아레나 삭제 실패");
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "투기장 삭제 실패" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
