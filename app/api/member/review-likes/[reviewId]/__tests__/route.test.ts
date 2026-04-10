// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

vi.mock(
    "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository",
    () => ({
        PrismaReviewLikeRepository: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.findByReviewIdAndMemberId = vi.fn();
            this.create = vi.fn();
            this.delete = vi.fn();
        }),
    })
);

vi.mock(
    "@/backend/review/infra/repositories/prisma/PrismaReviewRepository",
    () => ({
        PrismaReviewRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findById = vi.fn();
        }),
    })
);

vi.mock(
    "@/backend/member/infra/repositories/prisma/PrismaMemberRepository",
    () => ({
        PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findById = vi.fn();
            this.updateScore = vi.fn();
        }),
    })
);

vi.mock(
    "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository",
    () => ({
        PrismaScoreRecordRepository: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.create = vi.fn();
        }),
    })
);

vi.mock("@/backend/score-policy/domain/ScorePolicy", () => ({
    ScorePolicy: vi.fn(function (this: Record<string, unknown>) {
        this.getPolicy = vi.fn();
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

vi.mock(
    "@/backend/review-like/application/usecase/ToggleReviewLikeUsecase",
    () => ({
        ToggleReviewLikeUsecase: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockResolvedValue({ liked: true });
        }),
    })
);

import { POST } from "../route";

function makeRequest(reviewId: string) {
    return new NextRequest(
        `http://localhost/api/member/review-likes/${reviewId}`,
        {
            method: "POST",
        }
    );
}

function makeParams(reviewId: string) {
    return { params: Promise.resolve({ reviewId }) };
}

describe("POST /api/member/review-likes/[reviewId]", () => {
    it("returns 401 when not authenticated", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

        const response = await POST(makeRequest("1"), makeParams("1"));
        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 400 when reviewId is not a number", async () => {
        const response = await POST(makeRequest("abc"), makeParams("abc"));
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 500 when usecase throws", async () => {
        const { ToggleReviewLikeUsecase } = await import(
            "@/backend/review-like/application/usecase/ToggleReviewLikeUsecase"
        );
        vi.mocked(ToggleReviewLikeUsecase).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockRejectedValue(new Error("DB error"));
        } as unknown as typeof ToggleReviewLikeUsecase);

        const response = await POST(makeRequest("1"), makeParams("1"));
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 200 with result on success", async () => {
        const response = await POST(makeRequest("1"), makeParams("1"));
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toEqual({ liked: true });
    });
});
