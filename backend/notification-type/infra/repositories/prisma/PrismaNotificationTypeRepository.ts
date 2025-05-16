import { NotificationType, PrismaClient } from "@/prisma/generated";
import { NotificationTypeRepository } from "@/backend/notification-type/domain/repositories/NotificationTypeRepository";

export class PrismaNotificationTypeRepository
    implements NotificationTypeRepository
{
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async count(): Promise<number> {
        const count = await this.prisma.notificationType.count();

        return count;
    }

    async findAll(): Promise<NotificationType[]> {
        const data = await this.prisma.notificationType.findMany();

        return data;
    }

    async findById(id: number): Promise<NotificationType | null> {
        const data = await this.prisma.notificationType.findUnique({
            where: { id },
        });

        return data;
    }

    async save(type: NotificationType): Promise<NotificationType> {
        const data = await this.prisma.notificationType.create({
            data: type,
        });

        return data;
    }

    async update(type: NotificationType): Promise<NotificationType> {
        const newData = await this.prisma.notificationType.update({
            where: { id: type.id },
            data: type,
        });

        return newData;
    }

    async deleteById(id: number): Promise<void> {
        await this.prisma.notificationType.delete({ where: { id } });
    }
}
