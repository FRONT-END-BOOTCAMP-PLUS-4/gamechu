// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
    usePathname: () => "/",
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
    signOut: vi.fn(),
}));

// Mock js-cookie
vi.mock("js-cookie", () => ({
    default: { remove: vi.fn() },
}));

// Mock auth utility
vi.mock("@/utils/GetAuthUserId.client", () => ({
    getAuthUserId: vi.fn().mockResolvedValue(null),
}));

// Mock modalStore
vi.mock("@/stores/ModalStore", () => ({
    default: { getState: () => ({ openModal: vi.fn() }) },
}));

import Header from "../Header";

describe("Header accessibility", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("hamburger button has aria-expanded=false when menu is closed", () => {
        render(<Header />);
        const hamburger = screen.getByRole("button", { name: "메뉴 열기" });
        expect(hamburger.getAttribute("aria-expanded")).toBe("false");
    });

    it("hamburger button has aria-controls='mobile-menu'", () => {
        render(<Header />);
        const hamburger = screen.getByRole("button", { name: "메뉴 열기" });
        expect(hamburger.getAttribute("aria-controls")).toBe("mobile-menu");
    });

    it("hamburger aria-label changes to '메뉴 닫기' when menu is open", async () => {
        render(<Header />);
        const hamburger = screen.getByRole("button", { name: "메뉴 열기" });
        await userEvent.click(hamburger);
        const closingBtn = screen.getByRole("button", { name: "메뉴 닫기" });
        expect(closingBtn.getAttribute("aria-expanded")).toBe("true");
    });

    it("mobile menu has id='mobile-menu' and aria-hidden when closed", () => {
        render(<Header />);
        const menu = document.getElementById("mobile-menu");
        expect(menu).not.toBeNull();
        expect(menu?.getAttribute("aria-hidden")).toBe("true");
    });

    it("mobile menu aria-hidden is false when open", async () => {
        render(<Header />);
        const hamburger = screen.getByRole("button", { name: "메뉴 열기" });
        await userEvent.click(hamburger);
        const menu = document.getElementById("mobile-menu");
        expect(menu?.getAttribute("aria-hidden")).toBe("false");
    });
});
