import { NextRequest, NextResponse } from "next/server";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { VoteDto } from "@/backend/vote/application/usecase/dto/VoteDto";
import { UpdateVoteUsecase } from "@/backend/vote/application/usecase/UpdateVoteUsecase";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { CountVoteUsecase } from "@/backend/vote/application/usecase/CountVoteUsecase";

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

        const dto: VoteDto = {
            arenaId,
            memberId,
            votedTo,
        };

        const voteRepository = new PrismaVoteRepository();
        const arenaRepository = new PrismaArenaRepository();

        const updateVoteUsecase = new UpdateVoteUsecase(
            voteRepository,
            arenaRepository
        );
        const result = await updateVoteUsecase.execute(dto);

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
        const voteCountUsecase = new CountVoteUsecase(
            arenaRepository,
            voteRepository
        );

        const result = await voteCountUsecase.execute(arenaId);

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: `Failed to fetch vote counts: ${error}` },
            { status: 500 }
        );
    }
}
