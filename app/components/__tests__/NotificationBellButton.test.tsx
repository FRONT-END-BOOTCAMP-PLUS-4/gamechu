// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NotificationBellButton from "../NotificationBellButton";

vi.mock("@/hooks/useNotificationCount", () => ({
    useNotificationCount: vi.fn(),
}));

vi.mock("@/stores/ModalStore", () => ({
    default: {
        getState: () => ({ openModal: vi.fn() }),
    },
}));

vi.mock("next/image", () => ({
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        <img {...props} />
    ),
}));

import { useNotificationCount } from "@/hooks/useNotificationCount";

describe("NotificationBellButton", () => {
    it("count가 0이면 뱃지를 렌더링하지 않는다", () => {
        vi.mocked(useNotificationCount).mockReturnValue({
            data: { count: 0 },
        } as ReturnType<typeof useNotificationCount>);

        render(<NotificationBellButton />);

        expect(screen.getByRole("button", { name: "알림" })).toBeDefined();
        expect(screen.queryByText(/^\d+$|^99\+$/)).toBeNull();
    });

    it("count가 양수이면 뱃지에 숫자를 표시한다", () => {
        vi.mocked(useNotificationCount).mockReturnValue({
            data: { count: 5 },
        } as ReturnType<typeof useNotificationCount>);

        render(<NotificationBellButton />);

        expect(screen.getByText("5")).toBeDefined();
    });

    it("count가 99를 초과하면 '99+'를 표시한다", () => {
        vi.mocked(useNotificationCount).mockReturnValue({
            data: { count: 100 },
        } as ReturnType<typeof useNotificationCount>);

        render(<NotificationBellButton />);

        expect(screen.getByText("99+")).toBeDefined();
    });
});
