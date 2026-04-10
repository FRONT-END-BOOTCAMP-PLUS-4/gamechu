import { NextRequest, NextResponse } from "next/server";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { GetMemberPublicProfileUsecase } from "@/backend/member/application/usecase/GetMemberPublicProfileUsecase";
import { errorResponse } from "@/utils/ApiResponse";
import { withCache } from "@/lib/WithCache";
import { memberProfileKey } from "@/lib/CacheKey";
import logger from "@/lib/Logger";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ nickname: string }> }
) {
    const log = logger.child({
        route: "/api/member/profile/[nickname]",
        method: "GET",
    });
    try {
        const { nickname } = await params;
        const usecase = new GetMemberPublicProfileUsecase(
            new PrismaMemberRepository()
        );
        const profile = await withCache(memberProfileKey(nickname), 120, () =>
            usecase.execute(nickname)
        );

        if (!profile) return errorResponse("Not found", 404);

        return NextResponse.json(profile);
    } catch (error: unknown) {
        log.error({ err: error }, "닉네임 프로필 조회 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
