import { NextResponse } from "next/server";
import { CreateNotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/CreateNotificationRecordDto";
import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";
import { PrismaNotificationRecordRepository } from "@/backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository";
import { CreateNotificationRecordUsecase } from "@/backend/notification-record/application/usecase/CreateNotificationRecordUsecase";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // body validation
        if (!body.memberId) {
            return NextResponse.json(
                {
                    error: "Missing member id",
                },
                { status: 400 }
            );
        } else if (!body.typeId) {
            return NextResponse.json(
                {
                    error: "Missing type id",
                },
                { status: 400 }
            );
        } else if (!body.description) {
            return NextResponse.json(
                {
                    error: "Missing description",
                },
                { status: 400 }
            );
        }

        const createNotificationRecordDto = new CreateNotificationRecordDto(
            body.memberId,
            body.typeId,
            body.description
        );

        const notificationRecordRepository: NotificationRecordRepository =
            new PrismaNotificationRecordRepository();
        const createNotificationRecordUsecase: CreateNotificationRecordUsecase =
            new CreateNotificationRecordUsecase(notificationRecordRepository);

        const newRecord = await createNotificationRecordUsecase.execute(
            createNotificationRecordDto
        );

        return NextResponse.json(newRecord, { status: 201 });
    } catch (error) {
        console.error("Error creating notification records:", error);
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "알림 생성 실패" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
