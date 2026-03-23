// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("@/backend/member/infra/repositories/prisma/PrismaMemberRepository", () => ({
    PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
        this.findByNickname = vi.fn().mockResolvedValue(null);
    }),
}));

vi.mock("@/backend/member/application/usecase/GetMemberProfileByNicknameUsecase", () => ({
    GetMemberProfileByNicknameUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(null);
    }),
}));

import { GET } from "../route";

const makeRequest = () => new Request("http://localhost/api/member/profile/testuser");
const makeParams = (nickname = "testuser") => ({
    params: Promise.resolve({ nickname }),
});

describe("GET /api/member/profile/[nickname]", () => {
    it("returns 404 when profile not found", async () => {
        const response = await GET(makeRequest() as never, makeParams());
        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 500 when usecase throws", async () => {
        const { GetMemberProfileByNicknameUsecase } = await import(
            "@/backend/member/application/usecase/GetMemberProfileByNicknameUsecase"
        );
        vi.mocked(GetMemberProfileByNicknameUsecase).mockImplementationOnce(
            function (this: Record<string, unknown>) {
                this.execute = vi.fn().mockRejectedValue(new Error("DB error"));
            } as unknown as typeof GetMemberProfileByNicknameUsecase
        );

        const response = await GET(makeRequest() as never, makeParams());
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });
});
