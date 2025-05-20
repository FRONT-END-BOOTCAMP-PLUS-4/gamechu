import { DeleteNotificationRecordUsecase } from "@/backend/notification-record/application/usecase/DeleteNotificationRecordUsecase";
import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";
import { PrismaNotificationRecordRepository } from "@/backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository";
import { NextResponse } from "next/server";

type RequestParams = {
    params: {
        id: string;
    };
};

export async function DELETE(request: Request, { params }: RequestParams) {
    try {
        const { id } = await params;

        const notificationRecordRepository: NotificationRecordRepository =
            new PrismaNotificationRecordRepository();
        const deleteNotificationRecordUsecase: DeleteNotificationRecordUsecase =
            new DeleteNotificationRecordUsecase(notificationRecordRepository);

        await deleteNotificationRecordUsecase.execute(Number(id));

        return NextResponse.json(
            {
                message: "알림 삭제 성공",
            },
            { status: 200 }
        );
    } catch (error) {
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
