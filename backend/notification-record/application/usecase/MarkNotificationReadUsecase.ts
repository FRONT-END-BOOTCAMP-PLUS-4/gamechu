import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";

export class MarkNotificationReadUsecase {
    constructor(
        private readonly notificationRecordRepository: NotificationRecordRepository
    ) {}

    async execute(id: number): Promise<void> {
        const record = await this.notificationRecordRepository.findById(id);
        if (!record) throw new Error("알림을 찾을 수 없습니다.");
        await this.notificationRecordRepository.update({ ...record, isRead: true });
    }
}
