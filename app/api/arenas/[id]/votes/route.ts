import { NextRequest, NextResponse } from "next/server";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { GetVoteUsecase } from "@/backend/vote/application/usecase/GetVoteUsecase";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const arenaId = Number((await context.params).id);
    const memberId = await getAuthUserId();
    if (isNaN(arenaId)) {
        return NextResponse.json(
            { error: "유효하지 않은 투기장 ID입니다." },
            { status: 400 }
        );
    }

    try {
        const voteRepository = new PrismaVoteRepository();
        const arenaRepository = new PrismaArenaRepository();
        const getVoteUsecase = new GetVoteUsecase(
            arenaRepository,
            voteRepository
        );
        const result = await getVoteUsecase.execute(arenaId, memberId);

        return NextResponse.json(result);
    } catch (error) {
        console.error("투표 정보 조회 중 오류 발생:", error);
        return NextResponse.json(
            { error: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
