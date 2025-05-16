import { NotificationRecord, Prisma, PrismaClient } from "@/prisma/generated";
import { NotificationRecordFilter } from "@/backend/notification-record/domain/repositories/filters/NotificationRecordFilter";
import { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";

export class PrismaNotificationRecordRepository
    implements NotificationRecordRepository
{
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    private getWhereClause(
        filter: NotificationRecordFilter
    ): Prisma.NotificationRecordWhereInput {
        const { memberId, typeId, createdAt } = filter;

        return {
            ...(memberId && {
                memberId,
            }),
            ...(typeId && {
                typeId,
            }),
            ...(createdAt &&
                createdAt.length > 0 && {
                    OR: createdAt.map((date) => ({
                        createdAt: {
                            gte: new Date(date.setHours(0, 0, 0, 0)),
                            lt: new Date(date.setHours(24, 0, 0, 0)),
                        },
                    })),
                }),
        };
    }

    async count(filter: NotificationRecordFilter): Promise<number> {
        const count = await this.prisma.notificationRecord.count({
            where: this.getWhereClause(filter),
        });

        return count;
    }

    async findAll(
        filter: NotificationRecordFilter
    ): Promise<NotificationRecord[]> {
        const { sortField, ascending, offset, limit } = filter;
        const orderBy = sortField
            ? {
                  [sortField]: ascending ? "asc" : "desc",
              }
            : undefined;

        const data = await this.prisma.notificationRecord.findMany({
            where: this.getWhereClause(filter),
            skip: offset,
            take: limit,
            orderBy,
        });

        return data;
    }

    async findById(id: number): Promise<NotificationRecord | null> {
        const data = await this.prisma.notificationRecord.findUnique({
            where: { id },
        });

        return data;
    }

    async save(record: NotificationRecord): Promise<NotificationRecord> {
        const data = await this.prisma.notificationRecord.create({
            data: record,
        });

        return data;
    }

    async update(record: NotificationRecord): Promise<NotificationRecord> {
        const newData = await this.prisma.notificationRecord.update({
            where: { id: record.id },
            data: record,
        });

        return newData;
    }

    async deleteById(id: number): Promise<void> {
        await this.prisma.notificationRecord.delete({ where: { id } });
    }
}
