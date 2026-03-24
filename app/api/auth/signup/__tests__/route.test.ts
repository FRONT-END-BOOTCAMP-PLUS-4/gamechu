import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/redis", () => ({
    default: {
        pipeline: vi.fn().mockReturnValue({
            zremrangebyscore: vi.fn().mockReturnThis(),
            zcard: vi.fn().mockReturnThis(),
            pexpire: vi.fn().mockReturnThis(),
            exec: vi.fn().mockResolvedValue([[null, 0], [null, 0], [null, 1]]),
        }),
        zrange: vi.fn().mockResolvedValue([]),
        zadd: vi.fn().mockResolvedValue(1),
        pexpire: vi.fn().mockResolvedValue(1),
    },
}));

vi.mock("@/backend/member/infra/repositories/prisma/PrismaMemberRepository", () => ({
    PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
        this.findByEmail = vi.fn().mockResolvedValue(null);
        this.create = vi.fn().mockResolvedValue({
            id: "new-user-id",
            email: "test@example.com",
        });
    }),
}));

import { POST } from "../route";

function makeRequest(body: Record<string, unknown>) {
    return new NextRequest("http://localhost/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
    });
}

describe("POST /api/auth/signup", () => {
    it("valid body returns 201", async () => {
        const req = makeRequest({
            nickname: "tester",
            email: "test@example.com",
            password: "password123",
            birthDate: "19900101",
            gender: "M",
        });
        const response = await POST(req);
        expect(response.status).toBe(201);
    });

    it("short password returns 400", async () => {
        const req = makeRequest({
            nickname: "tester",
            email: "test@example.com",
            password: "short",
            birthDate: "19900101",
            gender: "M",
        });
        const response = await POST(req);
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.message).toContain("8자");
    });

    it("invalid gender returns 400", async () => {
        const req = makeRequest({
            nickname: "tester",
            email: "test@example.com",
            password: "password123",
            birthDate: "19900101",
            gender: "X",
        });
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    it("invalid birthDate format returns 400", async () => {
        const req = makeRequest({
            nickname: "tester",
            email: "test@example.com",
            password: "password123",
            birthDate: "1990-01-01",
            gender: "M",
        });
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    it("duplicate email returns 400", async () => {
        const { PrismaMemberRepository } = await import(
            "@/backend/member/infra/repositories/prisma/PrismaMemberRepository"
        );
        vi.mocked(PrismaMemberRepository).mockImplementation(
            class {
                findByEmail = vi.fn().mockResolvedValue({ id: "existing" });
                create = vi.fn();
            } as unknown as typeof PrismaMemberRepository
        );

        const req = makeRequest({
            nickname: "tester",
            email: "existing@example.com",
            password: "password123",
            birthDate: "19900101",
            gender: "M",
        });
        const response = await POST(req);
        expect(response.status).toBe(400);
    });
});
