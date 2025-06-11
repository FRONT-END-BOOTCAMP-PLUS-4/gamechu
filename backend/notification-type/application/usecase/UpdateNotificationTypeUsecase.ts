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
        const newArena = this.notificationTypeRepository.update(
            updateNotificationTypeDto
        );
        return newArena;
    }
}
