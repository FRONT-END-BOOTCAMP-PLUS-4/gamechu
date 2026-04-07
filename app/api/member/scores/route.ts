import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { GetScoreRecordsUsecase } from "@/backend/score-record/application/usecase/GetScoreRecordsUsecase";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { ScoreRecordRepository } from "@/backend/score-record/domain/repositories/ScoreRecordRepository";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { ApplyArenaScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";
import { validate } from "@/utils/Validation";

const ScoreBodySchema = z.object({
    policyId: z.number().int().positive(),
    actualScore: z.number(),
});

export async function GET() {
    const memberId = await getAuthUserId();
    const log = logger.child({ route: "/api/member/scores", method: "GET" });

    if (!memberId) {
        return errorResponse("Unauthorized", 401);
    }

    const repo = new PrismaScoreRecordRepository();
    const usecase = new GetScoreRecordsUsecase(repo);

    try {
        const result = await usecase.execute(memberId);
        return NextResponse.json(result);
    } catch (error) {
        log.error({ userId: memberId, err: error }, "점수 기록 조회 실패");
        return errorResponse("스코어 기록 조회 실패", 500);
    }
}

export async function POST(request: Request) {
    const log = logger.child({ route: "/api/member/scores", method: "POST" });
    try {
        const body = await request.json();
        const bodyValidation = validate(ScoreBodySchema, body);
        if (!bodyValidation.success) return bodyValidation.response;

        // member validation
        const memberId: string | null = await getAuthUserId();
        if (!memberId) {
            return errorResponse("점수 기록 작성 권한이 없습니다.", 401);
        }

        // TODO: apply refactored usecase for scorePolicy
        // execute usecase
        const scorePolicy: ScorePolicy = new ScorePolicy();
        const scoreRecordRepository: ScoreRecordRepository =
            new PrismaScoreRecordRepository();
        const memberRepository: MemberRepository = new PrismaMemberRepository();
        const applyArenaScoreUsecase: ApplyArenaScoreUsecase =
            new ApplyArenaScoreUsecase(
                scorePolicy,
                memberRepository,
                scoreRecordRepository
            );
        await applyArenaScoreUsecase.execute({
            memberId,
            result: "JOIN",
        });

        return NextResponse.json(null, { status: 201 });
    } catch (error: unknown) {
        log.error({ err: error }, "점수 기록 생성 실패");
        const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
