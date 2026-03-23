// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("next-auth", () => ({
    getServerSession: vi.fn().mockResolvedValue({
        user: { id: "test-member-id" },
    }),
}));

vi.mock("@/lib/auth/authOptions", () => ({
    authOptions: {},
}));

vi.mock("@/backend/member/infra/repositories/prisma/PrismaMemberRepository", () => ({
    PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
        this.findById = vi.fn();
        this.update = vi.fn();
    }),
}));

vi.mock("@/backend/member/application/usecase/GetMemberProfileUsecase", () => ({
    GetMemberProfileUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue({ id: "test-member-id", nickname: "TestUser" });
    }),
}));

vi.mock("@/backend/member/application/usecase/UpdateMemberProfileUseCase", () => ({
    UpdateMemberProfileUseCase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(undefined);
    }),
}));

import { GET, PUT } from "../route";

describe("GET /api/member/profile", () => {
    it("returns 401 when not authenticated", async () => {
        const { getServerSession } = await import("next-auth");
        vi.mocked(getServerSession).mockResolvedValueOnce(null);

        const response = await GET();
        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 404 when profile not found", async () => {
        const { GetMemberProfileUsecase } = await import(
            "@/backend/member/application/usecase/GetMemberProfileUsecase"
        );
        vi.mocked(GetMemberProfileUsecase).mockImplementationOnce(
            function (this: Record<string, unknown>) {
                this.execute = vi.fn().mockResolvedValue(null);
            } as unknown as typeof GetMemberProfileUsecase
        );

        const response = await GET();
        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 200 with profile on success", async () => {
        const response = await GET();
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty("id");
    });

    it("returns 500 when usecase throws", async () => {
        const { GetMemberProfileUsecase } = await import(
            "@/backend/member/application/usecase/GetMemberProfileUsecase"
        );
        vi.mocked(GetMemberProfileUsecase).mockImplementationOnce(
            function (this: Record<string, unknown>) {
                this.execute = vi.fn().mockRejectedValue(new Error("DB error"));
            } as unknown as typeof GetMemberProfileUsecase
        );

        const response = await GET();
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });
});

describe("PUT /api/member/profile", () => {
    it("returns 401 when not authenticated", async () => {
        const { getServerSession } = await import("next-auth");
        vi.mocked(getServerSession).mockResolvedValueOnce(null);

        const req = new Request("http://localhost/api/member/profile", {
            method: "PUT",
            body: JSON.stringify({ nickname: "NewName" }),
            headers: { "Content-Type": "application/json" },
        });
        const response = await PUT(req);
        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 200 on success", async () => {
        const req = new Request("http://localhost/api/member/profile", {
            method: "PUT",
            body: JSON.stringify({ nickname: "NewName" }),
            headers: { "Content-Type": "application/json" },
        });
        const response = await PUT(req);
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 400 when usecase throws", async () => {
        const { UpdateMemberProfileUseCase } = await import(
            "@/backend/member/application/usecase/UpdateMemberProfileUseCase"
        );
        vi.mocked(UpdateMemberProfileUseCase).mockImplementationOnce(
            function (this: Record<string, unknown>) {
                this.execute = vi.fn().mockRejectedValue(new Error("Validation failed"));
            } as unknown as typeof UpdateMemberProfileUseCase
        );

        const req = new Request("http://localhost/api/member/profile", {
            method: "PUT",
            body: JSON.stringify({ nickname: "X" }),
            headers: { "Content-Type": "application/json" },
        });
        const response = await PUT(req);
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });
});
