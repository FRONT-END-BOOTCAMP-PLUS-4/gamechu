import { DeleteNotificationRecordUsecase } from "@/backend/notification-record/application/usecase/DeleteNotificationRecordUsecase";
import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";
import { PrismaNotificationRecordRepository } from "@/backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository";
import { NotificationRecord } from "@/prisma/generated";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { errorResponse } from "@/utils/apiResponse";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

type RequestParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function DELETE(request: Request, { params }: RequestParams) {
    const memberId: string | null = await getAuthUserId();
    const log = logger.child({ route: "/api/member/notification-records/[id]", method: "DELETE" });
    try {
        // member validation
        if (!memberId) {
            return errorResponse("멤버가 아닙니다.", 401);
        }

        const { id }: { id: string } = await params;

        const notificationRecordRepository: NotificationRecordRepository =
            new PrismaNotificationRecordRepository();
        const deleteNotificationRecordUsecase: DeleteNotificationRecordUsecase =
            new DeleteNotificationRecordUsecase(notificationRecordRepository);

        // validation of notification record
        const notificationRecord: NotificationRecord | null =
            await notificationRecordRepository.findById(Number(id));

        if (!notificationRecord) {
            return errorResponse("알림이 존재하지 않습니다.", 404);
        }
        if (notificationRecord.memberId !== memberId) {
            return errorResponse("알림 삭제 권한이 없습니다.", 403);
        }

        // execute usecase
        await deleteNotificationRecordUsecase.execute(Number(id));
        return NextResponse.json(
            {
                message: "알림 삭제 성공",
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "알림 기록 삭제 실패");
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "알림 삭제 실패" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
