import { DeleteArenaUsecase } from "@/backend/arena/application/usecase/DeleteArenaUsecase";
import { GetArenaDetailDto } from "@/backend/arena/application/usecase/dto/GetArenaDetailDto";
import { UpdateArenaDetailDto } from "@/backend/arena/application/usecase/dto/UpdateArenaDetailDto";
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

type RequestParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(request: Request, { params }: RequestParams) {
    const { id } = await params;
    const arenaId: number = Number(id);

    if (isNaN(arenaId)) {
        return NextResponse.json({ error: "Invalid arenaId" }, { status: 400 });
    }
    const arenaRepository = new PrismaArenaRepository();
    const memberRepository = new PrismaMemberRepository();
    const voteRepository = new PrismaVoteRepository();
    const getArenaDetailusecase = new GetArenaDetailUsecase(
        arenaRepository,
        memberRepository,
        voteRepository
    );
    const getArenaDetailDto = new GetArenaDetailDto(Number(id));
    try {
        const result = await getArenaDetailusecase.execute(getArenaDetailDto);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: `Failed to fetch participants: ${error}` },
            { status: 500 }
        );
    }
}

// TODO: api/member/arena/[id]/route.ts 생성 완료! app에서 fetch 경로만 수정하면 끝
// 해당 API는 시스템(관리자)가 투기장을 자동으로 변경하는 경우 (status값 변화 등) 사용합니다!
export async function PATCH(req: NextRequest, { params }: RequestParams) {
    const { status, challengerId } = await req.json();
    const { id } = await params;
    const arenaId: number = Number(id);

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
    const updateArenaDetailDto = new UpdateArenaDetailDto(
        arenaId,
        status,
        challengerId
    );
    try {
        await updateArenaStatusUsecase.execute(updateArenaDetailDto); // challengerId 없으면 undefined
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

// 해당 API는 투기장 시작 시간 전까지 참여자가 모집되지 않을 경우 서버(관리자)가 자동으로 투기장을 삭제할 때 사용합니다!
export async function DELETE(request: Request, { params }: RequestParams) {
    try {
        const { id } = await params;
        const arenaId: number = Number(id);

        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const deleteArenaUsecase: DeleteArenaUsecase = new DeleteArenaUsecase(
            arenaRepository
        );

        // validation of arena
        const arena: Arena | null = await arenaRepository.findById(arenaId);

        if (!arena) {
            return NextResponse.json(
                { error: "투기장이 존재하지 않습니다." },
                { status: 404 }
            );
        }

        // execute usecase
        await deleteArenaUsecase.execute(arenaId);
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
