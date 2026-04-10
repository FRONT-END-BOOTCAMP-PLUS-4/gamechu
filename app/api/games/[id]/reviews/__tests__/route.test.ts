// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue(null),
}));

vi.mock(
    "@/backend/review/infra/repositories/prisma/PrismaReviewRepository",
    () => ({
        PrismaReviewRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findByGameId = vi.fn().mockResolvedValue([]);
        }),
    })
);

vi.mock(
    "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository",
    () => ({
        PrismaReviewLikeRepository: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.findByReviewId = vi.fn().mockResolvedValue([]);
        }),
    })
);

vi.mock(
    "@/backend/review/application/usecase/GetReviewsByGameIdUsecase",
    () => ({
        GetReviewsByGameIdUsecase: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockResolvedValue([]);
        }),
    })
);

import { GET } from "../route";

const makeRequest = (id = "1") =>
    new Request(`http://localhost/api/games/${id}/reviews`);

const makeParams = (id = "1") => ({
    params: Promise.resolve({ id }),
});

describe("GET /api/games/[id]/reviews", () => {
    it("returns 400 for invalid gameId", async () => {
        const response = await GET(
            makeRequest("abc") as never,
            makeParams("abc")
        );
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 500 when usecase throws", async () => {
        const { GetReviewsByGameIdUsecase } = await import(
            "@/backend/review/application/usecase/GetReviewsByGameIdUsecase"
        );
        vi.mocked(GetReviewsByGameIdUsecase).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockRejectedValue(new Error("DB error"));
        } as unknown as typeof GetReviewsByGameIdUsecase);

        const response = await GET(makeRequest() as never, makeParams());
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });
});
