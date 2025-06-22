import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { CreateVoteUsecase } from "@/backend/vote/application/usecase/CreateVoteUsecase";
import { SubmitVoteDto } from "@/backend/vote/application/usecase/dto/SubmitVoteDto";
import { UpdateVoteUsecase } from "@/backend/vote/application/usecase/UpdateVoteUsecase";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const memberId = await getAuthUserId();
        const body = await req.json();
        const { arenaId, votedTo } = body;

        if (!arenaId || !memberId || !votedTo) {
            return NextResponse.json(
                { message: "잘못된 요청입니다." },
                { status: 400 }
            );
        }

        const submitVoteDto: SubmitVoteDto = { arenaId, memberId, votedTo };

        const voteRepository = new PrismaVoteRepository();
        const arenaRepository = new PrismaArenaRepository();
        const createVoteUsecase = new CreateVoteUsecase(
            voteRepository,
            arenaRepository
        );

        const result = await createVoteUsecase.execute(submitVoteDto);
        return NextResponse.json(result, { status: 201 });
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "서버 오류";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const memberId = await getAuthUserId();
        const body = await req.json();
        const { arenaId, votedTo } = body;

        if (!arenaId || !memberId || !votedTo) {
            return NextResponse.json(
                { message: "잘못된 요청입니다." },
                { status: 400 }
            );
        }

        const submitVoteDto: SubmitVoteDto = { arenaId, memberId, votedTo };

        const voteRepository = new PrismaVoteRepository();
        const updateVoteUsecase = new UpdateVoteUsecase(voteRepository);

        const result = await updateVoteUsecase.execute(submitVoteDto);
        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        console.error("🔥 PATCH vote error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "서버 오류";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
