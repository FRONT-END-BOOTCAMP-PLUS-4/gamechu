import { GetNotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/GetNotificationRecordDto";
import { NotificationRecordListDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordListDto";
import { GetNotificationRecordUsecase } from "@/backend/notification-record/application/usecase/GetNotificationRecordUsecase";
import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";
import { PrismaNotificationRecordRepository } from "@/backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository";
import { NotificationTypeRepository } from "@/backend/notification-type/domain/repositories/NotificationTypeRepository";
import { PrismaNotificationTypeRepository } from "@/backend/notification-type/infra/repositories/prisma/PrismaNotificationTypeRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        // member validation
        const memberId: string | null = await getAuthUserId();
        if (!memberId) {
            return NextResponse.json(
                { error: "알림 조회 권한이 없습니다." },
                { status: 401 }
            );
        }

        // get query parameters from URL
        const url = new URL(request.url);
        const currentPageParam: string =
            url.searchParams.get("currentPage") || "1";

        // set up usecase
        const notificationRecordRepository: NotificationRecordRepository =
            new PrismaNotificationRecordRepository();
        const notificationTypeRepository: NotificationTypeRepository =
            new PrismaNotificationTypeRepository();

        const getNotificationRecordUsecase = new GetNotificationRecordUsecase(
            notificationRecordRepository,
            notificationTypeRepository
        );

        // set up query Dto
        const getNotificationRecordDto = new GetNotificationRecordDto(
            Number(currentPageParam),
            memberId
        );

        const notificationRecordListDto: NotificationRecordListDto =
            await getNotificationRecordUsecase.execute(
                getNotificationRecordDto
            );

        return NextResponse.json(notificationRecordListDto);
    } catch (error: unknown) {
        console.error("Error fetching notification records:", error);
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "알림 조회 실패" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
