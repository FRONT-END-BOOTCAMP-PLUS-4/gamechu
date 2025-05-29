import { NextRequest, NextResponse } from "next/server";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { SubmitVoteDto } from "@/backend/vote/application/usecase/dto/SubmitVoteDto";
import { SubmitVoteUsecase } from "@/backend/vote/application/usecase/SubmitVoteUsecase";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { VoteCountUsecase } from "@/backend/vote/application/usecase/VoteCountUsecase";

// POST /api/vote
export async function POST(req: NextRequest) {
    try {
        const memberId = await getAuthUserId();
        const body = await req.json();
        const { arenaId, votedTo } = body;

        // 기본 유효성 검사
        if (!arenaId || !memberId || !votedTo) {
            return NextResponse.json(
                { message: "잘못된 요청입니다." },
                { status: 400 }
            );
        }

        const dto: SubmitVoteDto = {
            arenaId,
            memberId,
            votedTo,
        };

        const voteRepository = new PrismaVoteRepository();
        const arenaRepository = new PrismaArenaRepository();

        const usecase = new SubmitVoteUsecase(voteRepository, arenaRepository);
        const result = await usecase.execute(dto);

        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        let errorMessage = "서버 오류";

        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
// /api/arenas/[id]/votes/route.ts

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const arenaId = Number((await context.params).id);

    if (isNaN(arenaId)) {
        return NextResponse.json({ error: "Invalid arenaId" }, { status: 400 });
    }

    try {
        const voteRepository = new PrismaVoteRepository();
        const arenaRepository = new PrismaArenaRepository();
        const voteCountUsecase = new VoteCountUsecase(
            arenaRepository,
            voteRepository
        );

        const voteCountResult = await voteCountUsecase.execute(arenaId);

        return NextResponse.json(voteCountResult);
    } catch (error) {
        return NextResponse.json(
            { error: `Failed to fetch vote counts: ${error}` },
            { status: 500 }
        );
    }
}
