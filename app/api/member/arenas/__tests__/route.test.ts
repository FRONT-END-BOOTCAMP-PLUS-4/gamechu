import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

vi.mock(
    "@/backend/member/infra/repositories/prisma/PrismaMemberRepository",
    () => ({
        PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findById = vi
                .fn()
                .mockResolvedValue({ id: "test-user-id", score: 200 });
            this.incrementScore = vi.fn().mockResolvedValue(undefined);
        }),
    })
);

vi.mock(
    "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository",
    () => ({
        PrismaScoreRecordRepository: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.createRecord = vi.fn().mockResolvedValue(undefined);
        }),
    })
);

vi.mock(
    "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository",
    () => ({
        PrismaArenaRepository: vi.fn(function () {}),
    })
);

const mockArena = {
    id: 1,
    creatorId: "test-user-id",
    title: "New Arena",
    status: 1,
    challengerId: null,
};

vi.mock("@/backend/arena/application/usecase/CreateArenaUsecase", () => ({
    CreateArenaUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(mockArena);
    }),
}));

import { POST } from "../route";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";

describe("POST /api/member/arenas", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("POST without auth session returns 401", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

        const req = new Request("http://localhost/api/member/arenas", {
            method: "POST",
            body: JSON.stringify({
                title: "Test",
                description: "Desc",
                startDate: "2026-04-01",
            }),
            headers: { "content-type": "application/json" },
        });
        const response = await POST(req);
        expect(response.status).toBe(401);
    });

    it("POST with valid session and body returns 201", async () => {
        const req = new Request("http://localhost/api/member/arenas", {
            method: "POST",
            body: JSON.stringify({
                title: "Test Arena",
                description: "Some description",
                startDate: "2026-04-01T00:00:00.000Z",
            }),
            headers: { "content-type": "application/json" },
        });
        const response = await POST(req);
        expect(response.status).toBe(201);
    });

    it("POST calls incrementScore(-100) and createRecord with policyId 4", async () => {
        const req = new Request("http://localhost/api/member/arenas", {
            method: "POST",
            body: JSON.stringify({
                title: "Test Arena",
                description: "Some description",
                startDate: "2026-04-01T00:00:00.000Z",
            }),
            headers: { "content-type": "application/json" },
        });

        await POST(req);

        const memberInst = vi
            .mocked(PrismaMemberRepository)
            .mock.instances.at(-1) as unknown as {
            incrementScore: ReturnType<typeof vi.fn>;
        };
        expect(memberInst.incrementScore).toHaveBeenCalledWith(
            "test-user-id",
            -100
        );

        const scoreInst = vi
            .mocked(PrismaScoreRecordRepository)
            .mock.instances.at(-1) as unknown as {
            createRecord: ReturnType<typeof vi.fn>;
        };
        expect(scoreInst.createRecord).toHaveBeenCalledWith(
            expect.objectContaining({ policyId: 4, actualScore: -100 })
        );
    });
});
