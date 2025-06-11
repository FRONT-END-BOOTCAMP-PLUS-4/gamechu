import { NotificationType } from "@/prisma/generated";
import { UpdateNotificationTypeDto } from "../../application/usecase/dto/UpdateNotificationTypeDto";

export type CreateNotificationTypeInput = Omit<NotificationType, "id">;
export interface NotificationTypeRepository {
    count(): Promise<number>;
    findAll(): Promise<NotificationType[]>;
    findById(id: number): Promise<NotificationType | null>;
    save(type: CreateNotificationTypeInput): Promise<NotificationType>;
    update(updateType: UpdateNotificationTypeDto): Promise<NotificationType>;
    deleteById(id: number): Promise<void>;
}
