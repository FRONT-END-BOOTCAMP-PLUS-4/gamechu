import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("owner-id"),
}));

vi.mock(
    "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository",
    () => ({
        PrismaArenaRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findById = vi.fn().mockResolvedValue({
                id: 1,
                creatorId: "owner-id",
                challengerId: null,
                status: 1,
            });
            this.deleteById = vi.fn().mockResolvedValue(undefined);
            this.update = vi.fn().mockResolvedValue(undefined);
        }),
    })
);

vi.mock("@/backend/arena/application/usecase/DeleteArenaUsecase", () => ({
    DeleteArenaUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(undefined);
    }),
}));

vi.mock("@/backend/arena/application/usecase/UpdateArenaUsecase", () => ({
    UpdateArenaUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(undefined);
    }),
}));

import { DELETE, PATCH } from "../route";

const params = Promise.resolve({ id: "1" });

describe("PATCH /api/member/arenas/[id]", () => {
    it("PATCH without auth returns 401", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

        const req = new Request("http://localhost/api/member/arenas/1", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: "updated" }),
        });
        const response = await PATCH(req, { params });
        expect(response.status).toBe(401);
    });

    it("PATCH without auth returns 401 even when request body is absent (auth checked before body parse)", async () => {
        // Regression: before fix, request.json() was called first — a missing body
        // would throw SyntaxError caught as 400/500 instead of a clean 401.
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

        const req = new Request("http://localhost/api/member/arenas/1", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            // no body — would blow up if request.json() were called first
        });
        const response = await PATCH(req, { params });
        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body.message).toBe("로그인이 필요합니다.");
    });

    it("PATCH with empty body returns 400", async () => {
        const req = new Request("http://localhost/api/member/arenas/1", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        const response = await PATCH(req, { params });
        expect(response.status).toBe(400);
    });

    it("PATCH by non-owner returns 403", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce("non-owner-id");

        const req = new Request("http://localhost/api/member/arenas/1", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: "unauthorized edit" }),
        });
        const response = await PATCH(req, { params });
        expect(response.status).toBe(403);
    });

    it("PATCH with valid body and auth returns 200", async () => {
        const req = new Request("http://localhost/api/member/arenas/1", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: "updated description" }),
        });
        const response = await PATCH(req, { params });
        expect(response.status).toBe(200);
    });
});

describe("DELETE /api/member/arenas/[id]", () => {
    it("DELETE without auth returns 401", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

        const req = new Request("http://localhost/api/member/arenas/1", {
            method: "DELETE",
        });
        const response = await DELETE(req, { params });
        expect(response.status).toBe(401);
    });

    it("DELETE by non-owner returns 403", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce("other-user-id");

        const req = new Request("http://localhost/api/member/arenas/1", {
            method: "DELETE",
        });
        const response = await DELETE(req, { params });
        expect(response.status).toBe(403);
    });

    it("DELETE by owner returns 200", async () => {
        const req = new Request("http://localhost/api/member/arenas/1", {
            method: "DELETE",
        });
        const response = await DELETE(req, { params });
        expect(response.status).toBe(200);
    });
});
