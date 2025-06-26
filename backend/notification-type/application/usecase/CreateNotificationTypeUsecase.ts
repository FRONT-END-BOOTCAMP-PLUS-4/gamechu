import { NotificationType } from "@/prisma/generated";
import {
    CreateNotificationTypeInput,
    NotificationTypeRepository,
} from "../../domain/repositories/NotificationTypeRepository";
import { CreateNotificationTypeDto } from "./dto/CreateNotificationTypeDto";

export class CreateNotificationTypeUsecase {
    private notificationTypeRepository: NotificationTypeRepository;

    constructor(notificationTypeRepository: NotificationTypeRepository) {
        this.notificationTypeRepository = notificationTypeRepository;
    }

    async execute(
        createNotificationTypeDto: CreateNotificationTypeDto
    ): Promise<NotificationType> {
        const notificationType: CreateNotificationTypeInput = {
            name: createNotificationTypeDto.name,
            imageUrl: createNotificationTypeDto.imageUrl,
        };

        const newNotificationType =
            await this.notificationTypeRepository.save(notificationType);
        return newNotificationType;
    }
}
