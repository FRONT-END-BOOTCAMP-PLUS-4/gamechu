// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TierBadge from "../TierBadge";

describe("TierBadge", () => {
    it("wrapper has role='img'", () => {
        render(<TierBadge score={500} />);
        // 500 points = 브론즈 tier
        const badge = screen.getByRole("img");
        expect(badge).toBeDefined();
    });

    it("wrapper has aria-label with tier name", () => {
        render(<TierBadge score={500} />);
        // getTier(500) returns 브론즈
        const badge = screen.getByRole("img", { name: "브론즈 티어" });
        expect(badge).toBeDefined();
    });

    it("inner Image has empty alt to prevent duplication", () => {
        render(<TierBadge score={500} />);
        // The img element from next/image should have alt=""
        // role="img" is on the div, so the inner img has no accessible name
        const badge = screen.getByRole("img", { name: "브론즈 티어" });
        const innerImg = badge.querySelector("img");
        expect(innerImg?.getAttribute("alt")).toBe("");
    });
});
