import { vi } from "vitest";
import type { NotificationRecordRepository } from "@/backend/notification-record/domain/repositories/NotificationRecordRepository";

export function createMockNotificationRecordRepository(): NotificationRecordRepository {
    return {
        count: vi.fn(),
        findAll: vi.fn(),
        findById: vi.fn(),
        save: vi.fn(),
        update: vi.fn(),
        deleteById: vi.fn(),
    };
}
