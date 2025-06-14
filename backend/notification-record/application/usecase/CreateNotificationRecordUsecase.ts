import {
    CreateNotificationRecordInput,
    NotificationRecordRepository,
} from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";
import { CreateNotificationRecordDto } from "./dto/CreateNotificationRecordDto";
import { NotificationRecord } from "@/prisma/generated";

export class CreateNotificationRecordUsecase {
    private notificationRecordRepository: NotificationRecordRepository;

    constructor(notificationRecordRepository: NotificationRecordRepository) {
        this.notificationRecordRepository = notificationRecordRepository;
    }

    async execute(
        createNotificationRecordDto: CreateNotificationRecordDto
    ): Promise<NotificationRecord> {
        const record: CreateNotificationRecordInput = {
            memberId: createNotificationRecordDto.memberId,
            typeId: createNotificationRecordDto.typeId,
            description: createNotificationRecordDto.description,
            createdAt: new Date(),
        };

        const newRecord = await this.notificationRecordRepository.save(record);
        return newRecord;
    }
}
