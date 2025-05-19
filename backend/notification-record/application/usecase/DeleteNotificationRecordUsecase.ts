import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";

export class DeleteNotificationRecordUsecase {
    private notificationRecordRepository: NotificationRecordRepository;

    constructor(notificationRecordRepository: NotificationRecordRepository) {
        this.notificationRecordRepository = notificationRecordRepository;
    }

    async execute(id: number): Promise<void> {
        if (!id) {
            throw new Error("id is required");
        }

        await this.notificationRecordRepository.deleteById(id);
    }
}
