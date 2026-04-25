import { NotificationRecord } from "@/prisma/generated";
import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";

export class MarkNotificationReadUsecase {
    constructor(
        private readonly notificationRecordRepository: NotificationRecordRepository
    ) {}

    async execute(record: NotificationRecord): Promise<void> {
        await this.notificationRecordRepository.update({ ...record, isRead: true });
    }
}
