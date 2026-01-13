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

        if (!arenaId) {
            return NextResponse.json(
                { error: "투기장을 찾을 수 없습니다." },
                { status: 400 }
            );
        }

        if (!memberId) {
            return NextResponse.json(
                { error: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        if (!votedTo) {
            return NextResponse.json(
                { error: "투표한 인원을 찾을 수 없습니다." },
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
        //TODO: Patch나 Delete의 경우 우선 해당 데이터가 존재하는지 확인하고, 없을 경우 에러를 출력하는 로직을 먼저 넣어주세요.
        const memberId = await getAuthUserId();
        const body = await req.json();
        const { arenaId, votedTo } = body;

        if (!arenaId) {
            return NextResponse.json(
                { error: "투기장을 찾을 수 없습니다." },
                { status: 400 }
            );
        }

        if (!memberId) {
            return NextResponse.json(
                { error: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        if (!votedTo) {
            return NextResponse.json(
                { error: "투표한 인원을 찾을 수 없습니다." },
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
