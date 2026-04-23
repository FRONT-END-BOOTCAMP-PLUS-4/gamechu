import { DeleteNotificationRecordUsecase } from "@/backend/notification-record/application/usecase/DeleteNotificationRecordUsecase";
import { MarkNotificationReadUsecase } from "@/backend/notification-record/application/usecase/MarkNotificationReadUsecase";
import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";
import { PrismaNotificationRecordRepository } from "@/backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository";
import { NotificationRecord } from "@/prisma/generated";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { errorResponse } from "@/utils/ApiResponse";
import { validate, IdSchema } from "@/utils/Validation";
import { NextResponse } from "next/server";
import logger from "@/lib/Logger";

type RequestParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(_req: Request, { params }: RequestParams) {
    const memberId = await getAuthUserId();
    const log = logger.child({
        route: "/api/member/notification-records/[id]",
        method: "PATCH",
    });

    if (!memberId) return errorResponse("알림 읽음 처리 권한이 없습니다.", 401);

    try {
        const { id: idStr } = await params;
        const v = validate(IdSchema, idStr);
        if (!v.success) return v.response;

        const repository: NotificationRecordRepository =
            new PrismaNotificationRecordRepository();
        const record: NotificationRecord | null = await repository.findById(v.data);
        if (!record) return errorResponse("알림을 찾을 수 없습니다.", 404);
        if (record.memberId !== memberId) return errorResponse("권한이 없습니다.", 403);

        const usecase = new MarkNotificationReadUsecase(repository);
        await usecase.execute(v.data);

        return NextResponse.json({ message: "읽음 처리 완료" });
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "알림 읽음 처리 실패");
        const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}

export async function DELETE(request: Request, { params }: RequestParams) {
    const memberId: string | null = await getAuthUserId();
    const log = logger.child({
        route: "/api/member/notification-records/[id]",
        method: "DELETE",
    });
    try {
        // member validation
        if (!memberId) {
            return errorResponse("멤버가 아닙니다.", 401);
        }

        const { id }: { id: string } = await params;
        const idValidated = validate(IdSchema, id);
        if (!idValidated.success) return idValidated.response;
        const notificationId = idValidated.data;

        const notificationRecordRepository: NotificationRecordRepository =
            new PrismaNotificationRecordRepository();
        const deleteNotificationRecordUsecase: DeleteNotificationRecordUsecase =
            new DeleteNotificationRecordUsecase(notificationRecordRepository);

        // validation of notification record
        const notificationRecord: NotificationRecord | null =
            await notificationRecordRepository.findById(notificationId);

        if (!notificationRecord) {
            return errorResponse("알림이 존재하지 않습니다.", 404);
        }
        if (notificationRecord.memberId !== memberId) {
            return errorResponse("알림 삭제 권한이 없습니다.", 403);
        }

        // execute usecase
        await deleteNotificationRecordUsecase.execute(notificationId);
        return NextResponse.json(
            {
                message: "알림 삭제 성공",
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "알림 기록 삭제 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
