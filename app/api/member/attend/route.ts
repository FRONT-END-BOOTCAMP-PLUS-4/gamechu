import { NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server"
import { ApplyAttendanceScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyAttendanceScoreUsecase"
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy"

export async function POST() {
    const memberId = await getAuthUserId(); // ✅ next-auth 쿠키에서 memberId 추출
    if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const memberRepo = new PrismaMemberRepository();
    const lastAttendedDate = await memberRepo.getLastAttendedDate(memberId);

    const usecase = new ApplyAttendanceScoreUsecase(
        new ScorePolicy(),
        memberRepo,
        new PrismaScoreRecordRepository()
    );

    await usecase.execute({ memberId, lastAttendedDate });

    return NextResponse.json({ success: true });
}
