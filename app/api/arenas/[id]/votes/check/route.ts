import { NextRequest, NextResponse } from "next/server";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { GetVoteUsecase } from "@/backend/vote/application/usecase/GetVoteUsecase";

// GET /api/arenas/[id]/votes/check?
export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const arenaId = Number(context.params.id);
        const memberId = await getAuthUserId();
        console.log("Arena ID:", arenaId);
        console.log("Member ID:", memberId);

        if (!arenaId) {
            return NextResponse.json(
                { message: "잘못된 쿼리입니다." },
                { status: 400 }
            );
        }

        const voteRepository = new PrismaVoteRepository();
        const getVoteUsecase = new GetVoteUsecase(voteRepository);
        const result = await getVoteUsecase.execute(arenaId, memberId);

        return NextResponse.json({ result }, { status: 200 });
    } catch (error: unknown) {
        let errorMessage = "서버 오류";

        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
