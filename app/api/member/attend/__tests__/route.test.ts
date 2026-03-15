import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("test-member-id"),
}));

const mockGetLastAttendedDate = vi.fn().mockResolvedValue(null);
const mockIncrementScore = vi.fn().mockResolvedValue(undefined);

vi.mock("@/backend/member/infra/repositories/prisma/PrismaMemberRepository", () => ({
    PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
        this.getLastAttendedDate = mockGetLastAttendedDate;
        this.incrementScore = mockIncrementScore;
        this.findById = vi.fn().mockResolvedValue({ id: "test-member-id", score: 100 });
    }),
}));

vi.mock("@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository", () => ({
    PrismaScoreRecordRepository: vi.fn(function (this: Record<string, unknown>) {
        this.save = vi.fn().mockResolvedValue(undefined);
    }),
}));

vi.mock("@/backend/score-policy/application/usecase/ApplyAttendanceScoreUsecase", () => ({
    ApplyAttendanceScoreUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(undefined);
    }),
}));

vi.mock("@/backend/score-policy/domain/ScorePolicy", () => ({
    ScorePolicy: vi.fn(function () {}),
}));

import { POST } from "../route";

describe("POST /api/member/attend", () => {
    it("returns 401 when not authenticated", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

        const response = await POST();
        expect(response.status).toBe(401);
    });

    it("returns 200 with { success: true, attendedDate: null } when no last attended date", async () => {
        mockGetLastAttendedDate.mockResolvedValueOnce(null);

        const response = await POST();
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.attendedDate).toBeNull();
    });

    it("returns 200 with attendedDate as a non-empty Korean locale string when last attended date exists", async () => {
        mockGetLastAttendedDate.mockResolvedValueOnce(new Date("2026-03-14T00:00:00.000Z"));

        const response = await POST();
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.success).toBe(true);
        expect(typeof body.attendedDate).toBe("string");
        expect(body.attendedDate.length).toBeGreaterThan(0);
    });
});
