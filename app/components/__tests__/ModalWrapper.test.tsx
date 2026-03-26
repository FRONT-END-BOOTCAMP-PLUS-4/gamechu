// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ModalWrapper from "../ModalWrapper";

vi.mock("focus-trap-react", () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("ModalWrapper", () => {
    it("renders dialog role when open", () => {
        render(
            <ModalWrapper isOpen={true} onClose={() => {}}>
                <button>Close</button>
            </ModalWrapper>
        );
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeDefined();
    });

    it("has aria-modal='true'", () => {
        render(
            <ModalWrapper isOpen={true} onClose={() => {}}>
                <button>Close</button>
            </ModalWrapper>
        );
        const dialog = screen.getByRole("dialog");
        expect(dialog.getAttribute("aria-modal")).toBe("true");
    });

    it("links to title via aria-labelledby when labelId is provided", () => {
        render(
            <ModalWrapper isOpen={true} onClose={() => {}} labelId="test-title">
                <h2 id="test-title">Test Modal</h2>
                <button>Close</button>
            </ModalWrapper>
        );
        const dialog = screen.getByRole("dialog");
        expect(dialog.getAttribute("aria-labelledby")).toBe("test-title");
    });

    it("renders nothing when closed", () => {
        render(
            <ModalWrapper isOpen={false} onClose={() => {}}>
                <button>Close</button>
            </ModalWrapper>
        );
        expect(screen.queryByRole("dialog")).toBeNull();
    });
});
