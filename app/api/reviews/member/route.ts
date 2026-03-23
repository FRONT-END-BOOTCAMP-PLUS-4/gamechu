import { NextResponse } from "next/server";
import { GetReviewsByMemberIdUsecase } from "@/backend/review/application/usecase/GetReviewsByMemberIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { errorResponse } from "@/utils/apiResponse";

export async function GET() {
    try {
        const memberId = await getAuthUserId();
        if (!memberId) {
            return errorResponse("Unauthorized", 401);
        }

        const usecase = new GetReviewsByMemberIdUsecase(new PrismaReviewRepository());
        const result = await usecase.execute(memberId);
        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("[reviews/member] error:", error);
        const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
