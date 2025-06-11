import { NotificationTypeRepository } from "../../domain/repositories/NotificationTypeRepository";
import { NotificationType } from "@/prisma/generated";

export class GetNotificationTypeUsecase {
    private notificationTypeRepository: NotificationTypeRepository;

    constructor(notificationTypeRepository: NotificationTypeRepository) {
        this.notificationTypeRepository = notificationTypeRepository;
    }

    async execute(): Promise<NotificationType[]> {
        try {
            const notificationTypes: NotificationType[] =
                await this.notificationTypeRepository.findAll();
            return notificationTypes;
        } catch (error) {
            console.error("Error retrieving notification types", error);
            throw new Error("Error retrieving notification types");
        }
    }
}
