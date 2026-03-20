import { describe, it, expect } from "vitest";

// Mirrors the validation logic in ToolbarPlugin.tsx:
//   if (linkUrl && /^https?:\/\//.test(linkUrl)) { dispatch link }
function isValidLinkUrl(url: string): boolean {
    return !!(url && /^https?:\/\//.test(url));
}

describe("ToolbarPlugin — link URL validation", () => {
    it("allows https URLs", () => {
        expect(isValidLinkUrl("https://example.com")).toBe(true);
    });

    it("allows http URLs", () => {
        expect(isValidLinkUrl("http://example.com")).toBe(true);
    });

    it("rejects javascript: protocol (XSS vector)", () => {
        expect(isValidLinkUrl("javascript:alert(1)")).toBe(false);
    });

    it("rejects ftp URLs", () => {
        expect(isValidLinkUrl("ftp://files.example.com")).toBe(false);
    });

    it("rejects empty string", () => {
        expect(isValidLinkUrl("")).toBe(false);
    });

    it("rejects protocol-relative URLs", () => {
        expect(isValidLinkUrl("//example.com")).toBe(false);
    });
});
