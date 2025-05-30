import { EndArenaUsecase } from "@/backend/arena/application/usecase/EndArenaUsecase";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { ApplyArenaScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const arenaId = Number((await context.params).id);

    const memberRepository = new PrismaMemberRepository();
    const scoreRecordRepository = new PrismaScoreRecordRepository();
    const scorePolicy = new ScorePolicy();
    const arenaRepository = new PrismaArenaRepository();
    const applyArenaScoreUsecase = new ApplyArenaScoreUsecase(
        scorePolicy,
        memberRepository,
        scoreRecordRepository
    );
    const voteRepository = new PrismaVoteRepository();
    const endArenaUsecase = new EndArenaUsecase(
        arenaRepository,
        applyArenaScoreUsecase,
        voteRepository
    );
    await endArenaUsecase.execute(arenaId);
    return new Response("OK");
}
