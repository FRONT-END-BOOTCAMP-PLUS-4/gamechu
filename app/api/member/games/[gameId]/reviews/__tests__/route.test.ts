import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

vi.mock("@/backend/review/infra/repositories/prisma/PrismaReviewRepository", () => ({
    PrismaReviewRepository: vi.fn(function () {
        this.findByMemberId = vi.fn().mockResolvedValue([]);
        this.create = vi.fn().mockResolvedValue({
            id: 1,
            gameId: 10,
            memberId: "test-user-id",
            content: "Great game",
            rating: 5,
        });
    }),
}));

vi.mock("@/backend/review/application/usecase/CreateReviewUsecase", () => ({
    CreateReviewUsecase: vi.fn(function () {
        this.execute = vi.fn().mockResolvedValue({
            id: 1,
            gameId: 10,
            content: "Great game",
            rating: 5,
        });
    }),
}));

import { POST } from "../route";

describe("POST /api/member/games/[gameId]/reviews", () => {
    it("POST without auth returns 401", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

        const req = new NextRequest(
            "http://localhost/api/member/games/10/reviews",
            {
                method: "POST",
                body: JSON.stringify({ gameId: 10, content: "Great", rating: 5 }),
                headers: { "content-type": "application/json" },
            }
        );
        const response = await POST(req);
        expect(response.status).toBe(401);
    });

    it("POST with valid body and auth returns 200", async () => {
        const req = new NextRequest(
            "http://localhost/api/member/games/10/reviews",
            {
                method: "POST",
                body: JSON.stringify({
                    gameId: 10,
                    content: "Great game",
                    rating: 5,
                }),
                headers: { "content-type": "application/json" },
            }
        );
        const response = await POST(req);
        expect(response.status).toBe(200);
    });
});
