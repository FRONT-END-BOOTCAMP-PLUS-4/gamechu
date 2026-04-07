// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfileWishlistTab from "../ProfileWishlistTab";

vi.mock("@/app/(base)/games/components/GameCardList", () => ({
    default: ({ games }: { games: unknown[] }) => (
        <div data-testid="game-card-list" data-count={games.length} />
    ),
}));

vi.mock("@/app/components/Pager", () => ({
    default: () => <div data-testid="pager" />,
}));

const defaultProps = {
    games: [],
    pages: [],
    currentPage: 1,
    endPage: 1,
    onPageChange: vi.fn(),
};

const sampleGames = [
    {
        id: 1,
        title: "사이버펑크 2077",
        developer: "CD Projekt Red",
        thumbnail: "/img1.jpg",
        platform: "PC",
        expertRating: 8.5,
        reviewCount: 42,
    },
    {
        id: 2,
        title: "엘든 링",
        developer: "FromSoftware",
        thumbnail: "/img2.jpg",
        platform: "PC",
        expertRating: 9.5,
        reviewCount: 100,
    },
];

describe("ProfileWishlistTab", () => {
    it("게임이 없을 때 위시리스트 고유 빈 상태 메시지를 표시한다", () => {
        render(<ProfileWishlistTab {...defaultProps} />);
        expect(
            screen.getByText("위시리스트에 등록된 게임이 없습니다."),
        ).toBeDefined();
    });

    it("게임이 있을 때 GameCardList를 렌더링한다", () => {
        render(
            <ProfileWishlistTab
                {...defaultProps}
                games={sampleGames}
                pages={[1]}
                endPage={1}
            />,
        );
        expect(screen.getByTestId("game-card-list")).toBeDefined();
        const list = screen.getByTestId("game-card-list");
        expect(list.getAttribute("data-count")).toBe("2");
    });

    it("게임이 있을 때 빈 상태 메시지를 표시하지 않는다", () => {
        render(
            <ProfileWishlistTab
                {...defaultProps}
                games={sampleGames}
                pages={[1]}
                endPage={1}
            />,
        );
        expect(
            screen.queryByText("위시리스트에 등록된 게임이 없습니다."),
        ).toBeNull();
    });

    it("endPage가 1보다 클 때 Pager를 렌더링한다", () => {
        render(
            <ProfileWishlistTab
                {...defaultProps}
                games={sampleGames}
                pages={[1, 2]}
                endPage={2}
            />,
        );
        expect(screen.getByTestId("pager")).toBeDefined();
    });

    it("endPage가 1일 때 Pager를 렌더링하지 않는다", () => {
        render(
            <ProfileWishlistTab
                {...defaultProps}
                games={sampleGames}
                pages={[1]}
                endPage={1}
            />,
        );
        expect(screen.queryByTestId("pager")).toBeNull();
    });
});
