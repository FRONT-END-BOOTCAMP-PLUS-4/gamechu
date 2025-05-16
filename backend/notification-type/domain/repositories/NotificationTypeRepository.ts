import { NotificationType } from "@/prisma/generated";

export interface NotificationTypeRepository {
    count(): Promise<number>;
    findAll(): Promise<NotificationType[]>;
    findById(id: number): Promise<NotificationType | null>;
    save(type: NotificationType): Promise<NotificationType>;
    update(type: NotificationType): Promise<NotificationType>;
    deleteById(id: number): Promise<void>;
}
