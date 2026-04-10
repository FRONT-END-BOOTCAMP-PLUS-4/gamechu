import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/Redis", () => ({
    default: {},
}));

vi.mock("@/lib/RateLimiter", () => ({
    RateLimiter: vi.fn(function (this: Record<string, unknown>) {
        this.check = vi.fn().mockResolvedValue({
            allowed: true,
            remaining: 9,
            retryAfterMs: 0,
        });
    }),
    getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
    rateLimitResponse: vi.fn(),
}));

const mockFindByNickname = vi.fn().mockResolvedValue(null);

vi.mock(
    "@/backend/member/infra/repositories/prisma/PrismaMemberRepository",
    () => ({
        PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findByNickname = mockFindByNickname;
        }),
    })
);

import { GET } from "../route";

describe("GET /api/auth/nickname-check", () => {
    it("200: 사용 가능한 닉네임", async () => {
        mockFindByNickname.mockResolvedValueOnce(null);

        const req = new Request(
            "http://localhost/api/auth/nickname-check?nickname=hello"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.message).toContain("사용 가능");
    });

    it("409: 이미 사용 중인 닉네임", async () => {
        mockFindByNickname.mockResolvedValueOnce({
            id: "member-1",
            nickname: "hello",
        });

        const req = new Request(
            "http://localhost/api/auth/nickname-check?nickname=hello"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(409);
        const body = await response.json();
        expect(body.message).toContain("이미 사용");
    });

    it("400: nickname 파라미터 누락", async () => {
        const req = new Request(
            "http://localhost/api/auth/nickname-check"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(400);
    });

    it("400: 8자 초과", async () => {
        const req = new Request(
            "http://localhost/api/auth/nickname-check?nickname=123456789"
        ) as never;

        const response = await GET(req);
        expect(response.status).toBe(400);
    });
});
