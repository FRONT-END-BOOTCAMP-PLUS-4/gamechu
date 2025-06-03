import { NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { GetScoreRecordsUsecase } from "@/backend/score-record/application/usecase/GetScoreRecordsUsecase";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { ScoreRecordRepository } from "@/backend/score-record/domain/repositories/ScoreRecordRepository";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { ApplyArenaScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase";

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

export async function POST(request: Request) {
    try {
        // body validation
        const body = await request.json();
        if (!body.policyId) {
            return NextResponse.json(
                { error: "점수 정책을 찾을 수 없습니다." },
                { status: 400 }
            );
        }

        if (!body.actualScore) {
            return NextResponse.json(
                { error: "점수를 찾을 수 없습니다." },
                { status: 400 }
            );
        }

        // member validation
        const memberId: string | null = await getAuthUserId();
        if (!memberId) {
            return NextResponse.json(
                { error: "점수 기록 작성 권한이 없습니다." },
                { status: 401 }
            );
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
        console.error("Error creating arenas:", error);
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "점수 기록 생성 실패" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
