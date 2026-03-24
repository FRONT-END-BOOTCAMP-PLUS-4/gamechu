import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/redis", () => ({
    default: {},
}));

vi.mock("@/lib/RateLimiter", () => ({
    RateLimiter: vi.fn(function (this: Record<string, unknown>) {
        this.check = vi.fn().mockResolvedValue({ allowed: true, remaining: 9, retryAfterMs: 0 });
    }),
    getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
    rateLimitResponse: vi.fn(),
}));

const mockFindByEmail = vi.fn().mockResolvedValue(null);

vi.mock("@/backend/member/infra/repositories/prisma/PrismaMemberRepository", () => ({
    PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
        this.findByEmail = mockFindByEmail;
    }),
}));

import { GET } from "../route";

describe("GET /api/auth/email-check", () => {
    it("returns 200 with available message when email is not taken", async () => {
        mockFindByEmail.mockResolvedValueOnce(null);

        const req = new Request(
            "http://localhost/api/auth/email-check?email=new@example.com"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.message).toContain("사용 가능");
    });

    it("returns 409 with taken message when email already exists", async () => {
        mockFindByEmail.mockResolvedValueOnce({ id: "existing-user", email: "taken@example.com" });

        const req = new Request(
            "http://localhost/api/auth/email-check?email=taken@example.com"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(409);

        const body = await response.json();
        expect(body.message).toContain("이미 존재");
    });

    it("returns 400 when email query param is missing", async () => {
        const req = new Request(
            "http://localhost/api/auth/email-check"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(400);
    });

    it("returns 400 when email format is invalid", async () => {
        const req = new Request(
            "http://localhost/api/auth/email-check?email=not-an-email"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.message).toContain("이메일");
    });
});
