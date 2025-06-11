import { NotificationRecord } from "@/prisma/generated";
import { NotificationRecordFilter } from "./filters/NotificationRecordFilter";
import { UpdateNotificationRecordDto } from "../../application/usecase/dto/UpdateNotificationRecordDto";

export type CreateNotificationRecordInput = Omit<NotificationRecord, "id">;

export interface NotificationRecordRepository {
    count(filter: NotificationRecordFilter): Promise<number>;
    findAll(filter: NotificationRecordFilter): Promise<NotificationRecord[]>;
    findById(id: number): Promise<NotificationRecord | null>;
    save(record: CreateNotificationRecordInput): Promise<NotificationRecord>;
    update(
        updateNotificationRecordDto: UpdateNotificationRecordDto
    ): Promise<NotificationRecord>;
    deleteById(id: number): Promise<void>;
}
