// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("test-member-id"),
}));

vi.mock(
    "@/backend/review/infra/repositories/prisma/PrismaReviewRepository",
    () => ({
        PrismaReviewRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findByMemberId = vi.fn().mockResolvedValue([]);
        }),
    })
);

vi.mock(
    "@/backend/review/application/usecase/GetReviewsByMemberIdUsecase",
    () => ({
        GetReviewsByMemberIdUsecase: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockResolvedValue([]);
        }),
    })
);

import { GET } from "../route";

describe("GET /api/reviews/member", () => {
    it("returns 401 when not authenticated", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

        const response = await GET();
        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 500 when usecase throws", async () => {
        const { GetReviewsByMemberIdUsecase } = await import(
            "@/backend/review/application/usecase/GetReviewsByMemberIdUsecase"
        );
        vi.mocked(GetReviewsByMemberIdUsecase).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockRejectedValue(new Error("DB error"));
        } as unknown as typeof GetReviewsByMemberIdUsecase);

        const response = await GET();
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });
});
