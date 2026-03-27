import { NextResponse } from "next/server";
import { GetReviewsByMemberIdUsecase } from "@/backend/review/application/usecase/GetReviewsByMemberIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { errorResponse } from "@/utils/apiResponse";
import logger from "@/lib/logger";

export async function GET() {
    const log = logger.child({ route: "/api/reviews/member", method: "GET" });
    const memberId = await getAuthUserId();
    try {
        if (!memberId) {
            return errorResponse("Unauthorized", 401);
        }

        const usecase = new GetReviewsByMemberIdUsecase(new PrismaReviewRepository());
        const result = await usecase.execute(memberId);
        return NextResponse.json(result);
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "본인 리뷰 목록 조회 실패");
        const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
