import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";
import { NotificationRecordFilter } from "@/backend/notification-record/domain/repositories/filters/NotificationRecordFilter";

export class GetUnreadNotificationCountUsecase {
    constructor(
        private readonly notificationRecordRepository: NotificationRecordRepository
    ) {}

    async execute(memberId: string): Promise<number> {
        const filter = new NotificationRecordFilter(
            memberId,
            null,
            null,
            false
        );
        return this.notificationRecordRepository.count(filter);
    }
}
