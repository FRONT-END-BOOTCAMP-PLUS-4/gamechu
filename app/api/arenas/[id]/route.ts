import { GetArenaDetailDto } from "@/backend/arena/application/usecase/dto/GetArenaDetailDto";
import { GetArenaDetailUsecase } from "@/backend/arena/application/usecase/GetArenaDetailUsecase";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { NextResponse } from "next/server";
import { withCache } from "@/lib/WithCache";
import { arenaDetailKey } from "@/lib/CacheKey";
import { validate, IdSchema } from "@/utils/Validation";
import { errorResponse } from "@/utils/ApiResponse";

type RequestParams = {
    params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RequestParams) {
    const { id } = await params;
    const idValidated = validate(IdSchema, id);
    if (!idValidated.success) return idValidated.response;
    const arenaId = idValidated.data;

    const arenaRepository = new PrismaArenaRepository();
    const memberRepository = new PrismaMemberRepository();
    const voteRepository = new PrismaVoteRepository();
    const getArenaDetailusecase = new GetArenaDetailUsecase(
        arenaRepository,
        memberRepository,
        voteRepository
    );
    const getArenaDetailDto = new GetArenaDetailDto(arenaId);
    try {
        const result = await withCache(arenaDetailKey(arenaId), 120, () =>
            getArenaDetailusecase.execute(getArenaDetailDto)
        );
        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        if (
            error instanceof Error &&
            error.message.includes("Arena not found")
        ) {
            return errorResponse("투기장이 존재하지 않습니다.", 404);
        }
        return errorResponse(`Failed to fetch participants: ${error}`, 500);
    }
}
