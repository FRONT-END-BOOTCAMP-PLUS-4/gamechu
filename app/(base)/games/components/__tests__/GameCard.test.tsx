// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GameCard from "../GameCard";

const defaultProps = {
    id: 1,
    platform: "PC",
    title: "사이버펑크 2077",
    expertRating: 8.5,
    developer: "CD Projekt Red",
    thumbnail: "https://example.com/thumb.jpg",
    reviewCount: 42,
};

describe("GameCard", () => {
    it("renders a link, not a clickable div", () => {
        render(<GameCard {...defaultProps} />);
        const link = screen.getByRole("link", {
            name: "사이버펑크 2077 게임 상세보기",
        });
        expect(link).toBeDefined();
        expect(link.tagName).toBe("A");
    });

    it("link href points to the game detail page", () => {
        render(<GameCard {...defaultProps} />);
        const link = screen.getByRole("link");
        expect(link.getAttribute("href")).toBe("/games/1");
    });

    it("review count container has aria-label", () => {
        render(<GameCard {...defaultProps} />);
        const reviewEl = screen.getByLabelText("리뷰 42개");
        expect(reviewEl).toBeDefined();
    });

    it("rating container has aria-label", () => {
        render(<GameCard {...defaultProps} />);
        const ratingEl = screen.getByLabelText("전문가 평점 8.5");
        expect(ratingEl).toBeDefined();
    });
});
