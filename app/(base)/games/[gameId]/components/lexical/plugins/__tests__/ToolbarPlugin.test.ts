import { describe, it, expect } from "vitest";

// Mirrors the AutoLink URL detection logic in Comment.tsx (AUTOLINK_MATCHERS).
const URL_REGEX =
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

function detectAutoLinkUrl(text: string): string | null {
    const match = URL_REGEX.exec(text);
    if (!match) return null;
    const url = match[0];
    return url.startsWith("http") ? url : `https://${url}`;
}

// Mirrors the LinkPlugin validateUrl in Comment.tsx:
//   validateUrl={(url) => /^https?:\/\//.test(url)}
function isValidLinkUrl(url: string): boolean {
    return /^https?:\/\//.test(url);
}

describe("AutoLink URL detection (AUTOLINK_MATCHERS in Comment.tsx)", () => {
    it("detects https URLs", () => {
        expect(detectAutoLinkUrl("https://example.com")).toBe(
            "https://example.com"
        );
    });

    it("detects http URLs", () => {
        expect(detectAutoLinkUrl("http://example.com")).toBe(
            "http://example.com"
        );
    });

    it("detects www. URLs and prepends https", () => {
        expect(detectAutoLinkUrl("www.example.com")).toBe(
            "https://www.example.com"
        );
    });

    it("detects URL within surrounding text", () => {
        expect(detectAutoLinkUrl("visit https://example.com now")).toBe(
            "https://example.com"
        );
    });

    it("returns null for plain text without URL", () => {
        expect(detectAutoLinkUrl("hello world")).toBeNull();
    });

    it("returns null for javascript: protocol (XSS vector)", () => {
        expect(detectAutoLinkUrl("javascript:alert(1)")).toBeNull();
    });
});

describe("LinkPlugin validateUrl (Comment.tsx)", () => {
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

    it("rejects protocol-relative URLs", () => {
        expect(isValidLinkUrl("//example.com")).toBe(false);
    });
});
