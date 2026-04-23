import { describe, it, expect, vi } from "vitest";
import { MarkNotificationReadUsecase } from "../MarkNotificationReadUsecase";
import { createMockNotificationRecordRepository } from "@/tests/mocks/createMockNotificationRecordRepository";

const mockRecord = {
    id: 1,
    memberId: "member-1",
    typeId: 1,
    description: "테스트 알림",
    isRead: false,
    createdAt: new Date(),
};

describe("MarkNotificationReadUsecase", () => {
    it("레코드 존재 시 isRead: true로 update를 1회 호출한다", async () => {
        const repository = createMockNotificationRecordRepository();
        vi.mocked(repository.findById).mockResolvedValue(mockRecord);
        vi.mocked(repository.update).mockResolvedValue({ ...mockRecord, isRead: true });

        const usecase = new MarkNotificationReadUsecase(repository);
        await usecase.execute(1);

        expect(repository.update).toHaveBeenCalledTimes(1);
        expect(repository.update).toHaveBeenCalledWith({ ...mockRecord, isRead: true });
    });

    it("알림이 없으면 Error를 throw한다", async () => {
        const repository = createMockNotificationRecordRepository();
        vi.mocked(repository.findById).mockResolvedValue(null);

        const usecase = new MarkNotificationReadUsecase(repository);
        await expect(usecase.execute(999)).rejects.toThrow("알림을 찾을 수 없습니다.");
    });
});
