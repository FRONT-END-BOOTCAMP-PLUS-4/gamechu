import { DeleteArenaUsecase } from "@/backend/arena/application/usecase/DeleteArenaUsecase";
import { GetArenaDetailUsecase } from "@/backend/arena/application/usecase/GetArenaDetailUsecase";
import { UpdateArenaStatusUsecase } from "@/backend/arena/application/usecase/UpdateArenaStatusUsecase";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { ApplyArenaScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { Arena } from "@/prisma/generated";
import { NextRequest, NextResponse } from "next/server";

type RequestParams = {
    params: Promise<{
        id: number;
    }>;
};

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const arenaId = Number((await context.params).id);

    if (isNaN(arenaId)) {
        return NextResponse.json({ error: "Invalid arenaId" }, { status: 400 });
    }
    const arenaRepository = new PrismaArenaRepository();
    const memberRepository = new PrismaMemberRepository();
    const getArenaDetailusecase = new GetArenaDetailUsecase(
        arenaRepository,
        memberRepository
    );

    try {
        const result = await getArenaDetailusecase.execute(arenaId);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: `Failed to fetch participants: ${error}` },
            { status: 500 }
        );
    }
}

// TODO: 리팩토링 하면서 api/member/arena/[id]/route.ts로 옮기기
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { status, challengerId } = await req.json();
    const arenaId = Number((await context.params).id);
    const scorePolicy = new ScorePolicy();
    const memberRepository = new PrismaMemberRepository();
    const scoreRecordRepository = new PrismaScoreRecordRepository();
    const applyArenaScoreUsecase = new ApplyArenaScoreUsecase(
        scorePolicy,
        memberRepository,
        scoreRecordRepository
    );
    const arenaRepository = new PrismaArenaRepository();
    const updateArenaStatusUsecase = new UpdateArenaStatusUsecase(
        arenaRepository,
        applyArenaScoreUsecase
    );

    try {
        await updateArenaStatusUsecase.execute(arenaId, status, challengerId); // challengerId 없으면 undefined
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Error updating arenas:", error);
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
    try {
        const { id } = await params;

        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const deleteArenaUsecase: DeleteArenaUsecase = new DeleteArenaUsecase(
            arenaRepository
        );

        // validation of arena
        const arena: Arena | null = await arenaRepository.findById(Number(id));

        if (!arena) {
            return NextResponse.json(
                { error: "투기장이 존재하지 않습니다." },
                { status: 404 }
            );
        }

        // execute usecase
        await deleteArenaUsecase.execute(Number(id));
        return NextResponse.json(
            { message: "투기장 삭제 성공" },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("Error deleting arenas:", error);
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
