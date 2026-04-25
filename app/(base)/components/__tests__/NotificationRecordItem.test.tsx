// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotificationRecordItem from "../NotificationRecordItem";
import type { NotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordDto";

vi.mock("next/image", () => ({
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        <img {...props} />
    ),
}));

const mockRecord: NotificationRecordDto = {
    id: 1,
    memberId: "member-1",
    typeId: 1,
    description: "테스트 알림입니다",
    isRead: false,
    createdAt: new Date("2026-01-01"),
    typeName: "티어 승급",
    typeImageUrl: "/icons/tier.svg",
};

function makeWrapper() {
    const client = new QueryClient({
        defaultOptions: {
            mutations: { retry: false },
            queries: { retry: false },
        },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };
}

describe("NotificationRecordItem", () => {
    beforeEach(() => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as Response);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("읽지 않은 알림 클릭 시 PATCH 요청을 보낸다", async () => {
        render(<NotificationRecordItem notificationRecordDto={mockRecord} />, {
            wrapper: makeWrapper(),
        });

        fireEvent.click(screen.getByText("테스트 알림입니다"));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith("/api/member/notification-records/1", {
                method: "PATCH",
            });
        });
    });

    it("이미 읽은 알림 클릭 시 PATCH 요청을 보내지 않는다", () => {
        render(
            <NotificationRecordItem
                notificationRecordDto={{ ...mockRecord, isRead: true }}
            />,
            { wrapper: makeWrapper() }
        );

        fireEvent.click(screen.getByText("테스트 알림입니다"));

        expect(fetch).not.toHaveBeenCalled();
    });

    it("삭제 버튼 클릭 시 DELETE 요청을 보낸다", async () => {
        render(<NotificationRecordItem notificationRecordDto={mockRecord} />, {
            wrapper: makeWrapper(),
        });

        fireEvent.click(screen.getByRole("button", { name: "알림 삭제" }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith("/api/member/notification-records/1", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
        });
    });
});
