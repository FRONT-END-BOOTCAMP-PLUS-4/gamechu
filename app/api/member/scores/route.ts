import { NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { GetScoreRecordsUsecase } from "@/backend/score-record/application/usecase/GetScoreRecordsUsecase";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";

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
