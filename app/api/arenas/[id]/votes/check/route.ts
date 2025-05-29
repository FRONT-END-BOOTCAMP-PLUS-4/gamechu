import { NextRequest, NextResponse } from "next/server";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";

// GET /api/arenas/[id]/votes/check?
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const arenaId = Number((await context.params).id);
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
        const votes = await voteRepository.findAll({
            arenaId,
            memberId,
            votedTo: null, // votedTo는 null로 설정하여 모든 투표를 조회
        });

        const existingVote = votes.length > 0 ? votes[0] : null;

        return NextResponse.json(
            { votedTo: existingVote ? existingVote.votedTo : null },
            { status: 200 }
        );
    } catch (error: unknown) {
        let errorMessage = "서버 오류";

        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
