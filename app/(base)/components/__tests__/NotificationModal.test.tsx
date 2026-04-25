// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import NotificationModal from "../NotificationModal";
import type { NotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordDto";

vi.mock("@/stores/ModalStore", () => ({
    default: vi.fn(),
}));

vi.mock("@/hooks/useNotifications", () => ({
    useNotifications: vi.fn(),
}));

vi.mock("@/hooks/useNotificationCount", () => ({
    useNotificationCount: vi.fn(),
}));

vi.mock("@/app/components/ModalWrapper", () => ({
    default: ({
        isOpen,
        children,
    }: {
        isOpen: boolean;
        children: React.ReactNode;
    }) => (isOpen ? <div role="dialog">{children}</div> : null),
}));

vi.mock("@/app/(base)/components/NotificationRecordList", () => ({
    default: ({
        notificationRecords,
    }: {
        notificationRecords: NotificationRecordDto[];
    }) => <div data-testid="notification-list">{notificationRecords.length}개</div>,
}));

vi.mock("@/app/components/Pager", () => ({
    default: () => <div data-testid="pager" />,
}));

import useModalStore from "@/stores/ModalStore";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationCount } from "@/hooks/useNotificationCount";

const emptyListResult = {
    data: { records: [], totalCount: 0, currentPage: 1, pages: [1], endPage: 1 },
    isLoading: false,
};

describe("NotificationModal", () => {
    beforeEach(() => {
        vi.mocked(useModalStore).mockReturnValue({
            isOpen: true,
            closeModal: vi.fn(),
        } as ReturnType<typeof useModalStore>);
        vi.mocked(useNotificationCount).mockReturnValue({
            data: { count: 0 },
        } as ReturnType<typeof useNotificationCount>);
    });

    it("isLoading이면 스켈레톤 4개를 렌더링한다", () => {
        vi.mocked(useNotifications).mockReturnValue({
            isLoading: true,
            data: undefined,
        } as ReturnType<typeof useNotifications>);

        const { container } = render(<NotificationModal />);

        expect(container.querySelectorAll(".animate-pulse")).toHaveLength(4);
    });

    it("빈 알림 목록이면 NotificationRecordList에 빈 배열을 전달한다", () => {
        vi.mocked(useNotifications).mockReturnValue(
            emptyListResult as ReturnType<typeof useNotifications>
        );

        render(<NotificationModal />);

        expect(screen.getByTestId("notification-list").textContent).toBe("0개");
    });

    it("알림이 있으면 NotificationRecordList에 해당 개수를 전달한다", () => {
        const records: NotificationRecordDto[] = [
            {
                id: 1,
                memberId: "m1",
                typeId: 1,
                description: "알림1",
                isRead: false,
                createdAt: new Date(),
                typeName: "티어 승급",
                typeImageUrl: "/icon.svg",
            },
            {
                id: 2,
                memberId: "m1",
                typeId: 2,
                description: "알림2",
                isRead: true,
                createdAt: new Date(),
                typeName: "티어 강등",
                typeImageUrl: "/icon.svg",
            },
        ];
        vi.mocked(useNotifications).mockReturnValue({
            data: { records, totalCount: 2, currentPage: 1, pages: [1], endPage: 1 },
            isLoading: false,
        } as ReturnType<typeof useNotifications>);

        render(<NotificationModal />);

        expect(screen.getByTestId("notification-list").textContent).toBe("2개");
    });

    it("endPage > 1이면 Pager를 렌더링한다", () => {
        vi.mocked(useNotifications).mockReturnValue({
            data: { records: [], totalCount: 6, currentPage: 1, pages: [1, 2], endPage: 2 },
            isLoading: false,
        } as ReturnType<typeof useNotifications>);

        render(<NotificationModal />);

        expect(screen.getByTestId("pager")).toBeDefined();
    });

    it("endPage가 1이면 Pager를 렌더링하지 않는다", () => {
        vi.mocked(useNotifications).mockReturnValue(
            emptyListResult as ReturnType<typeof useNotifications>
        );

        render(<NotificationModal />);

        expect(screen.queryByTestId("pager")).toBeNull();
    });

    it("미읽음 count가 양수이면 뱃지에 숫자를 표시한다", () => {
        vi.mocked(useNotificationCount).mockReturnValue({
            data: { count: 3 },
        } as ReturnType<typeof useNotificationCount>);
        vi.mocked(useNotifications).mockReturnValue(
            emptyListResult as ReturnType<typeof useNotifications>
        );

        render(<NotificationModal />);

        expect(screen.getByText("3")).toBeDefined();
    });
});
