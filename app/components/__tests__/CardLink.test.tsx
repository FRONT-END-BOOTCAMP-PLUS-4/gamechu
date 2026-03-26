// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CardLink from "../CardLink";

describe("CardLink", () => {
    it("renders an anchor tag (not a div)", () => {
        render(
            <CardLink href="/games/1" aria-label="테스트 게임 상세보기">
                <span>Card content</span>
            </CardLink>
        );
        const link = screen.getByRole("link", { name: "테스트 게임 상세보기" });
        expect(link).toBeDefined();
        expect(link.tagName).toBe("A");
    });

    it("passes href to the anchor", () => {
        render(
            <CardLink href="/games/42">
                <span>content</span>
            </CardLink>
        );
        const link = screen.getByRole("link");
        expect(link.getAttribute("href")).toBe("/games/42");
    });

    it("merges className onto the anchor", () => {
        render(
            <CardLink href="/games/1" className="rounded-xl">
                <span>content</span>
            </CardLink>
        );
        const link = screen.getByRole("link");
        expect(link.className).toContain("rounded-xl");
    });

    it("has focus-visible ring classes", () => {
        render(
            <CardLink href="/games/1">
                <span>content</span>
            </CardLink>
        );
        const link = screen.getByRole("link");
        expect(link.className).toContain("focus-visible:ring-2");
    });
});
