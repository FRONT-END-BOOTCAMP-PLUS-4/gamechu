import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

vi.mock(
    "@/backend/review/infra/repositories/prisma/PrismaReviewRepository",
    () => ({
        PrismaReviewRepository: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.findById = vi.fn().mockResolvedValue({
                id: 1,
                memberId: "test-user-id",
                gameId: 10,
                content: "{}",
                rating: 5,
            });
            this.update = vi.fn().mockResolvedValue({
                id: 1,
                gameId: 10,
                content: "{}",
                rating: 5,
            });
            this.delete = vi.fn().mockResolvedValue(undefined);
        }),
    })
);

vi.mock(
    "@/backend/review/application/usecase/UpdateReviewUsecase",
    () => ({
        UpdateReviewUsecase: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockResolvedValue({
                id: 1,
                gameId: 10,
                content: "{}",
                rating: 5,
            });
        }),
    })
);

vi.mock(
    "@/backend/review/application/usecase/DeleteReviewUsecase",
    () => ({
        DeleteReviewUsecase: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockResolvedValue(undefined);
        }),
    })
);

vi.mock(
    "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository",
    () => ({
        PrismaReviewLikeRepository: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.deleteByReviewId = vi.fn().mockResolvedValue(undefined);
        }),
    })
);

vi.mock(
    "@/backend/member/infra/repositories/prisma/PrismaMemberRepository",
    () => ({
        PrismaMemberRepository: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.findById = vi.fn().mockResolvedValue(null);
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

vi.mock("@/backend/score-policy/domain/ScorePolicy", () => ({
    ScorePolicy: vi.fn(function (this: Record<string, unknown>) {
        this.getPolicy = vi.fn().mockReturnValue(null);
    }),
}));

vi.mock(
    "@/backend/score-policy/application/usecase/ApplyReviewScoreUsecase",
    () => ({
        ApplyReviewScoreUsecase: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockResolvedValue(undefined);
        }),
    })
);

import { PATCH, DELETE } from "../route";

const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
const { PrismaReviewRepository } = await import(
    "@/backend/review/infra/repositories/prisma/PrismaReviewRepository"
);
const { UpdateReviewUsecase } = await import(
    "@/backend/review/application/usecase/UpdateReviewUsecase"
);

function makePatchRequest(reviewId: string, body: object) {
    return new NextRequest(
        `http://localhost/api/member/games/10/reviews/${reviewId}`,
        {
            method: "PATCH",
            body: JSON.stringify(body),
            headers: { "content-type": "application/json" },
        }
    );
}

function makeDeleteRequest(reviewId: string) {
    return new NextRequest(
        `http://localhost/api/member/games/10/reviews/${reviewId}`,
        { method: "DELETE" }
    );
}

const validBody = { content: "{}", rating: 5 };
const patchParams = (reviewId: string) =>
    ({ params: Promise.resolve({ reviewId }) }) as {
        params: Promise<{ reviewId: string }>;
    };
const deleteParams = (reviewId: string) =>
    ({ params: Promise.resolve({ gameId: "10", reviewId }) }) as {
        params: Promise<{ gameId: string; reviewId: string }>;
    };

describe("PATCH /api/member/games/[gameId]/reviews/[reviewId]", () => {
    beforeEach(() => {
        vi.mocked(getAuthUserId).mockResolvedValue("test-user-id");
        vi.mocked(PrismaReviewRepository).mockImplementation(function (
            this: Record<string, unknown>
        ) {
            this.findById = vi.fn().mockResolvedValue({
                id: 1,
                memberId: "test-user-id",
                gameId: 10,
                content: "{}",
                rating: 5,
            });
        });
        vi.mocked(UpdateReviewUsecase).mockImplementation(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi
                .fn()
                .mockResolvedValue({ id: 1, gameId: 10, content: "{}", rating: 5 });
        });
    });

    it("PATCH without auth returns 401", async () => {
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);
        const res = await PATCH(makePatchRequest("1", validBody), patchParams("1"));
        expect(res.status).toBe(401);
    });

    it("PATCH on non-existent review returns 404", async () => {
        vi.mocked(PrismaReviewRepository).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.findById = vi.fn().mockResolvedValue(null);
        });
        const res = await PATCH(makePatchRequest("1", validBody), patchParams("1"));
        expect(res.status).toBe(404);
    });

    it("PATCH on another user's review returns 403", async () => {
        vi.mocked(PrismaReviewRepository).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.findById = vi.fn().mockResolvedValue({
                id: 1,
                memberId: "other-user-id",
                gameId: 10,
                content: "{}",
                rating: 5,
            });
        });
        const res = await PATCH(makePatchRequest("1", validBody), patchParams("1"));
        expect(res.status).toBe(403);
    });

    it("PATCH with invalid content (usecase throws) returns 400", async () => {
        vi.mocked(UpdateReviewUsecase).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi
                .fn()
                .mockRejectedValue(new Error("유효하지 않은 콘텐츠 형식입니다."));
        });
        const res = await PATCH(
            makePatchRequest("1", { content: "<script>alert(1)</script>", rating: 5 }),
            patchParams("1")
        );
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.message).toBe("유효하지 않은 콘텐츠 형식입니다.");
    });

    it("PATCH with valid body returns 200", async () => {
        const res = await PATCH(makePatchRequest("1", validBody), patchParams("1"));
        expect(res.status).toBe(200);
    });
});

describe("DELETE /api/member/games/[gameId]/reviews/[reviewId]", () => {
    beforeEach(() => {
        vi.mocked(getAuthUserId).mockResolvedValue("test-user-id");
        vi.mocked(PrismaReviewRepository).mockImplementation(function (
            this: Record<string, unknown>
        ) {
            this.findById = vi.fn().mockResolvedValue({
                id: 1,
                memberId: "test-user-id",
                gameId: 10,
                content: "{}",
                rating: 5,
            });
        });
    });

    it("DELETE without auth returns 401", async () => {
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);
        const res = await DELETE(makeDeleteRequest("1"), deleteParams("1"));
        expect(res.status).toBe(401);
    });

    it("DELETE on non-existent review returns 404", async () => {
        vi.mocked(PrismaReviewRepository).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.findById = vi.fn().mockResolvedValue(null);
        });
        const res = await DELETE(makeDeleteRequest("1"), deleteParams("1"));
        expect(res.status).toBe(404);
    });

    it("DELETE with valid review returns 200", async () => {
        const res = await DELETE(makeDeleteRequest("1"), deleteParams("1"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.message).toBe("리뷰 삭제 완료");
    });
});
