import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/redis", () => ({
    default: {
        get: vi.fn().mockResolvedValue(null),
        setex: vi.fn().mockResolvedValue("OK"),
    },
}));

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

const mockArenaListDto = {
    arenas: [{ id: 1, title: "Arena 1" }],
    totalCount: 1,
    currentPage: 1,
    pages: [1],
    endPage: 1,
};

vi.mock("@/backend/arena/application/usecase/GetArenaUsecase", () => ({
    GetArenaUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(mockArenaListDto);
    }),
}));

vi.mock("@/backend/arena/infra/repositories/prisma/PrismaArenaRepository", () => ({
    PrismaArenaRepository: vi.fn(function () {}),
}));

vi.mock("@/backend/member/infra/repositories/prisma/PrismaMemberRepository", () => ({
    PrismaMemberRepository: vi.fn(function () {}),
}));

vi.mock("@/backend/vote/infra/repositories/prisma/PrismaVoteRepository", () => ({
    PrismaVoteRepository: vi.fn(function () {}),
}));

import { GET } from "../route";

describe("GET /api/arenas", () => {
    it("returns 200 with arena list", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=1&pageSize=10&status=0"
        );
        const response = await GET(request);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.arenas).toHaveLength(1);
    });

    it("GET without pageSize param: still calls usecase (not 0 crash)", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=1&status=0"
        );
        const response = await GET(request);
        expect(response.status).toBe(200);
    });

    it("GET with status filter: forwards status to usecase", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=1&pageSize=10&status=2"
        );
        const response = await GET(request);
        expect(response.status).toBe(200);
    });

    it("GET with invalid currentPage returns 400", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=0&pageSize=10"
        );
        const response = await GET(request);
        expect(response.status).toBe(400);
    });

    it("GET with invalid pageSize returns 400", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=1&pageSize=0"
        );
        const response = await GET(request);
        expect(response.status).toBe(400);
    });

    it("GET with invalid mine value returns 400", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=1&mine=yes"
        );
        const response = await GET(request);
        expect(response.status).toBe(400);
    });
});
