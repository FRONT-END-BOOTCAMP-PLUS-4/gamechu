import { EndArenaUsecase } from "@/backend/arena/application/usecase/EndArenaUsecase";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { ApplyArenaScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { NextResponse } from "next/server";

type RequestParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function POST(request: Request, { params }: RequestParams) {
    const { id } = await params;
    const arenaId: number = Number(id);

    const memberRepository = new PrismaMemberRepository();
    const scoreRecordRepository = new PrismaScoreRecordRepository();
    const scorePolicy = new ScorePolicy();
    const arenaRepository = new PrismaArenaRepository();
    const applyArenaScoreUsecase = new ApplyArenaScoreUsecase(
        scorePolicy,
        memberRepository,
        scoreRecordRepository
    );
    const voteRepository = new PrismaVoteRepository();
    const endArenaUsecase = new EndArenaUsecase(
        arenaRepository,
        applyArenaScoreUsecase,
        voteRepository
    );
    try {
        await endArenaUsecase.execute(arenaId);
        return NextResponse.json(
            { message: "투기장 종료 성공" },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("Error ending arenas:", error);
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "투기장 종료 실패" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
