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
        return NextResponse.json({ error: "Invalid arenaId" }, { status: 400 });
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
        return NextResponse.json(
            { error: `Failed to fetch vote counts: ${error}` },
            { status: 500 }
        );
    }
}
