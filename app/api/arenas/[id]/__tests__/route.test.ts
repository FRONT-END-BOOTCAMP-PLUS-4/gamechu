import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/Redis", () => ({
    default: {
        del: vi.fn().mockResolvedValue(1),
        incr: vi.fn().mockResolvedValue(1),
        get: vi.fn().mockResolvedValue(null),
        setex: vi.fn().mockResolvedValue("OK"),
    },
}));

vi.mock("@/backend/arena/application/usecase/GetArenaDetailUsecase", () => ({
    GetArenaDetailUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue({ id: 1, title: "Test Arena" });
    }),
}));

vi.mock("@/backend/arena/application/usecase/UpdateArenaStatusUsecase", () => ({
    UpdateArenaStatusUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(undefined);
    }),
}));

vi.mock("@/backend/arena/application/usecase/EndArenaUsecase", () => ({
    EndArenaUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(undefined);
    }),
}));

vi.mock("@/backend/arena/application/usecase/DeleteArenaUsecase", () => ({
    DeleteArenaUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(undefined);
    }),
}));

vi.mock("@/backend/arena/infra/repositories/prisma/PrismaArenaRepository", () => ({
    PrismaArenaRepository: vi.fn(function (this: Record<string, unknown>) {
        this.findById = vi.fn().mockResolvedValue({ id: 1 });
        this.getArenaById = vi.fn().mockResolvedValue({ id: 1 });
    }),
}));

vi.mock("@/backend/member/infra/repositories/prisma/PrismaMemberRepository", () => ({
    PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
        this.findById = vi.fn().mockResolvedValue({ id: "member-1", score: 200 });
    }),
}));

vi.mock("@/backend/vote/infra/repositories/prisma/PrismaVoteRepository", () => ({
    PrismaVoteRepository: vi.fn(function () {}),
}));

vi.mock("@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase", () => ({
    ApplyArenaScoreUsecase: vi.fn(function () {}),
}));

vi.mock("@/backend/score-policy/domain/ScorePolicy", () => ({
    ScorePolicy: vi.fn(function () {}),
}));

vi.mock("@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository", () => ({
    PrismaScoreRecordRepository: vi.fn(function () {}),
}));

import redis from "@/lib/Redis";
import { PATCH, DELETE } from "../route";

const makeParams = (id = "1") => ({ params: Promise.resolve({ id }) });

describe("PATCH /api/arenas/[id]", () => {
    beforeEach(() => vi.clearAllMocks());

    it("status update: calls redis.del and redis.incr for cache invalidation", async () => {
        const req = new Request("http://localhost/api/arenas/1", {
            method: "PATCH",
            body: JSON.stringify({ status: 2, challengerId: "member-1" }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PATCH(req as never, makeParams("1"));
        expect(response.status).toBe(200);
        expect(redis.del).toHaveBeenCalledWith("arena:detail:1");
        expect(redis.incr).toHaveBeenCalledWith("arena:list:version");
    });

    it("invalid id returns 400, no cache calls made", async () => {
        const req = new Request("http://localhost/api/arenas/abc", {
            method: "PATCH",
            body: JSON.stringify({ status: 2 }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PATCH(req as never, makeParams("abc"));
        expect(response.status).toBe(400);
        expect(redis.del).not.toHaveBeenCalled();
        expect(redis.incr).not.toHaveBeenCalled();
    });
});

describe("DELETE /api/arenas/[id]", () => {
    beforeEach(() => vi.clearAllMocks());

    it("deletion: calls redis.del and redis.incr for cache invalidation", async () => {
        const req = new Request("http://localhost/api/arenas/1", {
            method: "DELETE",
        });

        const response = await DELETE(req as never, makeParams("1"));
        expect(response.status).toBe(200);
        expect(redis.del).toHaveBeenCalledWith("arena:detail:1");
        expect(redis.incr).toHaveBeenCalledWith("arena:list:version");
    });

    it("arena not found: returns 404, no cache calls made", async () => {
        const { PrismaArenaRepository } = await import(
            "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository"
        );
        vi.mocked(PrismaArenaRepository).mockImplementationOnce(
            function (this: Record<string, unknown>) {
                this.findById = vi.fn().mockResolvedValue(null);
            } as unknown as typeof PrismaArenaRepository
        );

        const req = new Request("http://localhost/api/arenas/1", {
            method: "DELETE",
        });

        const response = await DELETE(req as never, makeParams("1"));
        expect(response.status).toBe(404);
        expect(redis.del).not.toHaveBeenCalled();
        expect(redis.incr).not.toHaveBeenCalled();
    });
});
