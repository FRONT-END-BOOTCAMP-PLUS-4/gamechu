import { NotificationType } from "@/prisma/generated";

export type CreateNotificationTypeInput = Omit<NotificationType, "id">;
export interface NotificationTypeRepository {
    count(): Promise<number>;
    findAll(): Promise<NotificationType[]>;
    findById(id: number): Promise<NotificationType | null>;
    save(type: CreateNotificationTypeInput): Promise<NotificationType>;
    update(type: NotificationType): Promise<NotificationType>;
    deleteById(id: number): Promise<void>;
}
