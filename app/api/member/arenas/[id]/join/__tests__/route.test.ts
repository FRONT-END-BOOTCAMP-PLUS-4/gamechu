import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("user-id"),
}));

vi.mock(
    "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository",
    () => ({
        PrismaArenaRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findById = vi.fn().mockResolvedValue({
                id: 1,
                creatorId: "creator-id",
                challengerId: null,
                status: 1,
                startDate: new Date(Date.now() + 60_000),
            });
            this.update = vi.fn().mockResolvedValue(undefined);
        }),
    })
);

vi.mock(
    "@/backend/member/infra/repositories/prisma/PrismaMemberRepository",
    () => ({
        PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findById = vi
                .fn()
                .mockResolvedValue({ id: "user-id", score: 200 });
        }),
    })
);

vi.mock(
    "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository",
    () => ({
        PrismaScoreRecordRepository: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.create = vi.fn().mockResolvedValue(undefined);
        }),
    })
);

vi.mock("@/backend/arena/application/usecase/UpdateArenaStatusUsecase", () => ({
    UpdateArenaStatusUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(undefined);
    }),
}));

vi.mock("@/lib/ArenaTimerRecovery", () => ({
    scheduleArenaTransitions: vi.fn(),
}));

import { POST } from "../route";

const params = Promise.resolve({ id: "1" });

describe("POST /api/member/arenas/[id]/join", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 401 when not authenticated", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

        const req = new Request("http://localhost/api/member/arenas/1/join", {
            method: "POST",
        });
        const res = await POST(req, { params });
        expect(res.status).toBe(401);
    });

    it("returns 403 when creator tries to join own arena", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce("creator-id");

        const req = new Request("http://localhost/api/member/arenas/1/join", {
            method: "POST",
        });
        const res = await POST(req, { params });
        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.message).toMatch(/본인이 만든/);
    });

    it("returns 409 when arena already has a challenger", async () => {
        const { PrismaArenaRepository } = await import(
            "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository"
        );
        vi.mocked(PrismaArenaRepository).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.findById = vi.fn().mockResolvedValue({
                id: 1,
                creatorId: "creator-id",
                challengerId: "existing-challenger",
                status: 2,
                startDate: new Date(Date.now() + 60_000),
            });
            this.update = vi.fn();
        });

        const req = new Request("http://localhost/api/member/arenas/1/join", {
            method: "POST",
        });
        const res = await POST(req, { params });
        expect(res.status).toBe(409);
    });

    it("returns 403 when member score < 100", async () => {
        const { PrismaMemberRepository } = await import(
            "@/backend/member/infra/repositories/prisma/PrismaMemberRepository"
        );
        vi.mocked(PrismaMemberRepository).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.findById = vi.fn().mockResolvedValue({
                id: "user-id",
                score: 50,
            });
        });

        const req = new Request("http://localhost/api/member/arenas/1/join", {
            method: "POST",
        });
        const res = await POST(req, { params });
        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.message).toMatch(/100점/);
    });

    it("returns 200 on valid join", async () => {
        const req = new Request("http://localhost/api/member/arenas/1/join", {
            method: "POST",
        });
        const res = await POST(req, { params });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.message).toBe("참가 완료");
    });
});
