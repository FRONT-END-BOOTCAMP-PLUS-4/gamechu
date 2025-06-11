import {
    CreateNotificationTypeInput,
    NotificationTypeRepository,
} from "@/backend/notification-type/domain/repositories/NotificationTypeRepository";
import { NotificationType, PrismaClient } from "@/prisma/generated";
import { UpdateNotificationTypeDto } from "@/backend/notification-type/application/usecase/dto/UpdateNotificationTypeDto";

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

    async save(type: CreateNotificationTypeInput): Promise<NotificationType> {
        const data = await this.prisma.notificationType.create({
            data: type,
        });

        return data;
    }

    async update(
        UpdateNotificationTypeDto: UpdateNotificationTypeDto
    ): Promise<NotificationType> {
        const { id, ...fields } = UpdateNotificationTypeDto;

        // undefined가 아닌 값만 추림
        const data: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
            if (value !== undefined) {
                data[key] = value;
            }
        }

        const newData = await this.prisma.notificationType.update({
            where: { id },
            data,
        });

        return newData;
    }

    async deleteById(id: number): Promise<void> {
        await this.prisma.notificationType.delete({ where: { id } });
    }
}
