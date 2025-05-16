import { NotificationRecord } from "@/prisma/generated";
import { NotificationRecordFilter } from "./filters/NotificationRecordFilter";

export interface NotificationRecordRepository {
    count(filter?: NotificationRecordFilter): Promise<number>;
    findAll(filter?: NotificationRecordFilter): Promise<NotificationRecord[]>;
    findById(id: number): Promise<NotificationRecord | null>;
    save(record: NotificationRecord): Promise<NotificationRecord>;
    update(record: NotificationRecord): Promise<NotificationRecord>;
    deleteById(id: number): Promise<void>;
}
