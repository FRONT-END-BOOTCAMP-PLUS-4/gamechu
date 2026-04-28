import { GetUnreadNotificationCountUsecase } from "@/backend/notification-record/application/usecase/GetUnreadNotificationCountUsecase";
import { PrismaNotificationRecordRepository } from "@/backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { errorResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";
import logger from "@/lib/Logger";

export async function GET() {
    const memberId = await getAuthUserId();
    const log = logger.child({
        route: "/api/member/notification-records/count",
        method: "GET",
    });

    if (!memberId) return errorResponse("알림 조회 권한이 없습니다.", 401);

    try {
        const repository = new PrismaNotificationRecordRepository();
        const usecase = new GetUnreadNotificationCountUsecase(repository);
        const count = await usecase.execute(memberId);

        return NextResponse.json({ count });
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "미읽음 알림 수 조회 실패");
        const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
