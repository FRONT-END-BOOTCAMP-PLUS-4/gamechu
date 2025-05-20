import { GetNotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/GetNotificationRecordDto";
import { NotificationRecordListDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordListDto";
import { GetNotificationRecordUsecase } from "@/backend/notification-record/application/usecase/GetNotificationRecordUsecase";
import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";
import { PrismaNotificationRecordRepository } from "@/backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository";
import { NotificationTypeRepository } from "@/backend/notification-type/domain/repositories/NotificationTypeRepository";
import { PrismaNotificationTypeRepository } from "@/backend/notification-type/infra/repositories/prisma/PrismaNotificationTypeRepository";
import { getMemberIdFromToken } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
            return NextResponse.json(
                {
                    error: "인증 정보가 없습니다.",
                },
                { status: 401 }
            );
        }
        const memberId = await getMemberIdFromToken(authHeader);
        console.log(memberId);

        if (!memberId) {
            return NextResponse.json(
                {
                    error: "멤버 아이디를 찾을 수 없습니다.",
                },
                { status: 400 }
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
    } catch (error) {
        console.error("Error fetching notification records:", error);
        return NextResponse.json(
            { error: "Failed to fetch notification records" },
            { status: 500 }
        );
    }
}
