import { describe, it, expect } from "vitest";
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
    it("레코드를 isRead: true로 update를 1회 호출한다", async () => {
        const repository = createMockNotificationRecordRepository();

        const usecase = new MarkNotificationReadUsecase(repository);
        await usecase.execute(mockRecord);

        expect(repository.update).toHaveBeenCalledTimes(1);
        expect(repository.update).toHaveBeenCalledWith({ ...mockRecord, isRead: true });
    });
});
