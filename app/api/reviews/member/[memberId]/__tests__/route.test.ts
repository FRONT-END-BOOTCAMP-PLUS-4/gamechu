// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

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

function makeParams(memberId: string) {
    return { params: Promise.resolve({ memberId }) };
}

describe("GET /api/reviews/member/[memberId]", () => {
    it("returns 404 when memberId is empty", async () => {
        const response = await GET(
            new Request("http://localhost"),
            makeParams("")
        );
        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 200 with reviews on success", async () => {
        const response = await GET(
            new Request("http://localhost"),
            makeParams("member-123")
        );
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
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

        const response = await GET(
            new Request("http://localhost"),
            makeParams("member-123")
        );
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });
});
