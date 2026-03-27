import { NextResponse } from "next/server";
import { GetReviewsByMemberIdUsecase } from "@/backend/review/application/usecase/GetReviewsByMemberIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { errorResponse } from "@/utils/apiResponse";
import logger from "@/lib/logger";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ memberId: string }> }
) {
    const log = logger.child({ route: "/api/reviews/member/[memberId]", method: "GET" });
    try {
        const { memberId } = await params;

        if (!memberId) {
            return errorResponse("Not Found", 404);
        }

        const usecase = new GetReviewsByMemberIdUsecase(new PrismaReviewRepository());
        const result = await usecase.execute(memberId);
        return NextResponse.json(result);
    } catch (error: unknown) {
        log.error({ err: error }, "회원 리뷰 목록 조회 실패");
        const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
