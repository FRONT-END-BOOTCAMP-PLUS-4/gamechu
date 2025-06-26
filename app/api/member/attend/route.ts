import { NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { ApplyAttendanceScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyAttendanceScoreUsecase";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";

export async function POST() {
    const memberId = await getAuthUserId(); // ✅ next-auth 쿠키에서 memberId 추출
    if (!memberId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberRepo = new PrismaMemberRepository();
    const lastAttendedDate = await memberRepo.getLastAttendedDate(memberId); // ← 이건 UTC 기반일 수 있음

    const usecase = new ApplyAttendanceScoreUsecase(
        new ScorePolicy(),
        memberRepo,
        new PrismaScoreRecordRepository()
    );

    await usecase.execute({ memberId, lastAttendedDate });

    // ✅ lastAttendedDate를 한국 시간 기준 문자열로 변환
    let attendedDateStr: string | null = null;
    if (lastAttendedDate) {
        const localDateStr = new Date(lastAttendedDate).toLocaleDateString(
            "ko-KR",
            {
                timeZone: "Asia/Seoul",
            }
        );
        attendedDateStr = localDateStr;
    }

    return NextResponse.json({
        success: true,
        attendedDate: attendedDateStr, // ✅ 클라이언트가 정확히 비교할 수 있도록
    });
}
