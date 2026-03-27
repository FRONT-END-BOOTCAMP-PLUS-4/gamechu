import { NextRequest, NextResponse } from "next/server";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { GetMemberProfileByNicknameUsecase } from "@/backend/member/application/usecase/GetMemberProfileByNicknameUsecase";
import { errorResponse } from "@/utils/apiResponse";
import { withCache } from "@/lib/withCache";
import { memberProfileKey } from "@/lib/cacheKey";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ nickname: string }> }
) {
    try {
        const { nickname } = await params;
        const usecase = new GetMemberProfileByNicknameUsecase(
            new PrismaMemberRepository()
        );
        const profile = await withCache(
            memberProfileKey(nickname),
            120,
            () => usecase.execute(nickname)
        );

        if (!profile) return errorResponse("Not found", 404);

        return NextResponse.json(profile);
    } catch (error: unknown) {
        console.error("[profile/nickname] error:", error);
        const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
