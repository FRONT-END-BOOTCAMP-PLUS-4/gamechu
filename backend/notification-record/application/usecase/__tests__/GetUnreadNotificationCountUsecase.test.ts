import { describe, it, expect, vi } from "vitest";
import { GetUnreadNotificationCountUsecase } from "../GetUnreadNotificationCountUsecase";
import { createMockNotificationRecordRepository } from "@/tests/mocks/createMockNotificationRecordRepository";
import { NotificationRecordFilter } from "@/backend/notification-record/domain/repositories/filters/NotificationRecordFilter";

describe("GetUnreadNotificationCountUsecase", () => {
    it("미읽음 알림 3건 존재 시 3을 반환한다", async () => {
        const repository = createMockNotificationRecordRepository();
        vi.mocked(repository.count).mockResolvedValue(3);

        const usecase = new GetUnreadNotificationCountUsecase(repository);
        const result = await usecase.execute("member-1");

        expect(result).toBe(3);
    });

    it("미읽음 알림 0건 시 0을 반환한다", async () => {
        const repository = createMockNotificationRecordRepository();
        vi.mocked(repository.count).mockResolvedValue(0);

        const usecase = new GetUnreadNotificationCountUsecase(repository);
        const result = await usecase.execute("member-1");

        expect(result).toBe(0);
    });

    it("count 호출 시 filter의 isRead가 false임을 확인한다", async () => {
        const repository = createMockNotificationRecordRepository();
        vi.mocked(repository.count).mockResolvedValue(0);

        const usecase = new GetUnreadNotificationCountUsecase(repository);
        await usecase.execute("member-1");

        const calledFilter = vi.mocked(repository.count).mock
            .calls[0][0] as NotificationRecordFilter;
        expect(calledFilter.isRead).toBe(false);
        expect(calledFilter.memberId).toBe("member-1");
    });
});
