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
        this.execute = vi
            .fn()
            .mockResolvedValue({ id: 1, title: "Test Arena" });
    }),
}));

vi.mock(
    "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository",
    () => ({
        PrismaArenaRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findById = vi.fn().mockResolvedValue({ id: 1 });
        }),
    })
);

vi.mock(
    "@/backend/member/infra/repositories/prisma/PrismaMemberRepository",
    () => ({
        PrismaMemberRepository: vi.fn(function () {}),
    })
);

vi.mock(
    "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository",
    () => ({
        PrismaVoteRepository: vi.fn(function () {}),
    })
);

import { GET } from "../route";

const makeParams = (id = "1") => ({ params: Promise.resolve({ id }) });

describe("GET /api/arenas/[id]", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns arena detail on success", async () => {
        const req = new Request("http://localhost/api/arenas/1");
        const response = await GET(req, makeParams("1"));
        expect(response.status).toBe(200);
    });

    it("invalid id returns 400", async () => {
        const req = new Request("http://localhost/api/arenas/abc");
        const response = await GET(req, makeParams("abc"));
        expect(response.status).toBe(400);
    });
});
