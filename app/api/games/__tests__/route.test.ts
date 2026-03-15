import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/redis", () => ({
    default: {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue("OK"),
    },
}));

const mockGames = [{ id: 1, title: "Game 1" }];

vi.mock("@/backend/game/application/usecase/GetFilteredGamesUsecase", () => ({
    GetFilteredGamesUsecase: vi.fn(function () {
        this.execute = vi
            .fn()
            .mockResolvedValue({ data: mockGames, totalCount: 1 });
    }),
}));

vi.mock("@/backend/game/application/usecase/GetGameMetaDataUsecase", () => ({
    GetGameMetaDataUsecase: vi.fn(function () {
        this.execute = vi
            .fn()
            .mockResolvedValue({ genres: [], themes: [], platforms: [] });
    }),
}));

vi.mock("@/backend/game/infra/repositories/prisma/GamePrismaRepository", () => ({
    GamePrismaRepository: vi.fn(function () {}),
}));
vi.mock("@/backend/review/infra/repositories/prisma/PrismaReviewRepository", () => ({
    PrismaReviewRepository: vi.fn(function () {}),
}));
vi.mock("@/backend/genre/infra/repositories/prisma/PrismaGenreRepository", () => ({
    PrismaGenreRepository: vi.fn(function () {}),
}));
vi.mock("@/backend/theme/infra/repositories/prisma/PrismaThemeRepository", () => ({
    PrismaThemeRepository: vi.fn(function () {}),
}));
vi.mock("@/backend/platform/infra/repositories/prisma/PrismaPlatformRepository", () => ({
    PrismaPlatformRepository: vi.fn(function () {}),
}));

import { GET } from "../route";

describe("GET /api/games", () => {
    it("returns 200 with games array", async () => {
        const req = new NextRequest("http://localhost/api/games");
        const response = await GET(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.games).toHaveLength(1);
        expect(data.totalCount).toBe(1);
    });
});
