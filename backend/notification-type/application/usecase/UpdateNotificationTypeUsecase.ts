import { NotificationTypeRepository } from "../../domain/repositories/NotificationTypeRepository";
import { UpdateNotificationTypeDto } from "./dto/UpdateNotificationTypeDto";
import { NotificationType } from "@/prisma/generated";

export class UpdateArenaUsecase {
    private notificationTypeRepository: NotificationTypeRepository;

    constructor(notificationTypeRepository: NotificationTypeRepository) {
        this.notificationTypeRepository = notificationTypeRepository;
    }

    async execute(
        updateNotificationTypeDto: UpdateNotificationTypeDto
    ): Promise<NotificationType> {
        const type = await this.notificationTypeRepository.findById(
            updateNotificationTypeDto.id
        );

        if (!type) {
            throw new Error("Notification not found");
        }

        if (updateNotificationTypeDto.imageUrl) {
            type.imageUrl = updateNotificationTypeDto.imageUrl;
        }

        if (updateNotificationTypeDto.name) {
            type.name = updateNotificationTypeDto.name;
        }

        const newType = this.notificationTypeRepository.update(type);
        return newType;
    }
}
