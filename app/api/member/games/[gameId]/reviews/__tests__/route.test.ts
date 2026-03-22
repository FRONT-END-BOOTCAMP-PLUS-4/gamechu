import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

vi.mock("@/backend/review/infra/repositories/prisma/PrismaReviewRepository", () => ({
    PrismaReviewRepository: vi.fn(function (this: Record<string, unknown>) {
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
    CreateReviewUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue({
            id: 1,
            gameId: 10,
            content: "Great game",
            rating: 5,
        });
    }),
}));

import { POST } from "../route";

const { CreateReviewUsecase } = await import(
    "@/backend/review/application/usecase/CreateReviewUsecase"
);

describe("POST /api/member/games/[gameId]/reviews", () => {
    beforeEach(() => {
        vi.mocked(CreateReviewUsecase).mockImplementation(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockResolvedValue({
                id: 1,
                gameId: 10,
                content: "Great game",
                rating: 5,
            });
        });
    });
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
        const response = await POST(req, { params: Promise.resolve({ gameId: "10" }) });
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
        const response = await POST(req, { params: Promise.resolve({ gameId: "10" }) });
        expect(response.status).toBe(200);
    });

    it("POST with non-JSON content returns 400", async () => {
        vi.mocked(CreateReviewUsecase).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi
                .fn()
                .mockRejectedValueOnce(
                    new Error("유효하지 않은 콘텐츠 형식입니다.")
                );
        });

        const req = new NextRequest(
            "http://localhost/api/member/games/10/reviews",
            {
                method: "POST",
                body: JSON.stringify({
                    gameId: 10,
                    content: "<script>alert(1)</script>",
                    rating: 5,
                }),
                headers: { "content-type": "application/json" },
            }
        );
        const response = await POST(req);
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.message).toBe("유효하지 않은 콘텐츠 형식입니다.");
    });

    it("POST with content exceeding 10,000 chars returns 400", async () => {
        vi.mocked(CreateReviewUsecase).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi
                .fn()
                .mockRejectedValueOnce(
                    new Error("리뷰는 최대 10,000자까지 작성할 수 있습니다.")
                );
        });

        const req = new NextRequest(
            "http://localhost/api/member/games/10/reviews",
            {
                method: "POST",
                body: JSON.stringify({
                    gameId: 10,
                    content: "a".repeat(10_001),
                    rating: 5,
                }),
                headers: { "content-type": "application/json" },
            }
        );
        const response = await POST(req);
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.message).toContain("10,000자");
    });
});
