import { NextResponse } from "next/server";
import { CreateNotificationRecordDto, CreateNotificationRecordSchema } from "@/backend/notification-record/application/usecase/dto/CreateNotificationRecordDto";
import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";
import { PrismaNotificationRecordRepository } from "@/backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository";
import { CreateNotificationRecordUsecase } from "@/backend/notification-record/application/usecase/CreateNotificationRecordUsecase";
import { NotificationRecord } from "@/prisma/generated";
import { validate } from "@/utils/Validation";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";

export async function POST(request: Request) {
    const log = logger.child({ route: "/api/notification-records", method: "POST" });
    try {
        const body = await request.json();

        const parsed = validate(CreateNotificationRecordSchema, body);
        if (!parsed.success) return parsed.response;

        const { memberId, typeId, description } = parsed.data;

        const createNotificationRecordDto: CreateNotificationRecordDto =
            new CreateNotificationRecordDto(
                memberId,
                typeId,
                description
            );

        const notificationRecordRepository: NotificationRecordRepository =
            new PrismaNotificationRecordRepository();
        const createNotificationRecordUsecase: CreateNotificationRecordUsecase =
            new CreateNotificationRecordUsecase(notificationRecordRepository);

        const newRecord: NotificationRecord =
            await createNotificationRecordUsecase.execute(
                createNotificationRecordDto
            );

        return NextResponse.json(newRecord, { status: 201 });
    } catch (error: unknown) {
        log.error({ err: error }, "알림 기록 생성 실패");
        const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
