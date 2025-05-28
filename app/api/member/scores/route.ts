import { NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { GetScoreRecordsUsecase } from "@/backend/score-record/application/usecase/GetScoreRecordsUsecase";

export async function GET() {
    const memberId = await getAuthUserId();

    if (!memberId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const repo = new PrismaScoreRecordRepository();
    const usecase = new GetScoreRecordsUsecase(repo);

    try {
        const result = await usecase.execute(memberId);
        return NextResponse.json(result);
    } catch (error) {
        console.error("[SCORE_RECORDS_ERROR]", error);
        return NextResponse.json(
            { message: "스코어 기록 조회 실패" },
            { status: 500 }
        );
    }
}
