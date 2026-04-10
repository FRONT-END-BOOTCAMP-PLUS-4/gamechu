import { NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { ApplyAttendanceScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyAttendanceScoreUsecase";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { errorResponse } from "@/utils/ApiResponse";
import logger from "@/lib/Logger";

export async function POST() {
    const memberId = await getAuthUserId();
    const log = logger.child({ route: "/api/member/attend", method: "POST" });
    try {
        if (!memberId) {
            return errorResponse("Unauthorized", 401);
        }

        const memberRepo = new PrismaMemberRepository();
        const lastAttendedDate = await memberRepo.getLastAttendedDate(memberId);

        const usecase = new ApplyAttendanceScoreUsecase(
            new ScorePolicy(),
            memberRepo,
            new PrismaScoreRecordRepository()
        );

        await usecase.execute({ memberId, lastAttendedDate });

        let attendedDateStr: string | null = null;
        if (lastAttendedDate) {
            attendedDateStr = new Date(lastAttendedDate).toLocaleDateString(
                "ko-KR",
                {
                    timeZone: "Asia/Seoul",
                }
            );
        }

        return NextResponse.json({
            success: true,
            attendedDate: attendedDateStr,
        });
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "출석 체크 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
