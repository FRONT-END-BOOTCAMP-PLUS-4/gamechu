// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("test-member-id"),
}));

vi.mock("@/backend/wishlist/infra/repositories/prisma/PrismaWishListRepository", () => ({
    PrismaWishListRepository: vi.fn(function (this: Record<string, unknown>) {
        this.findByMemberId = vi.fn();
        this.findByGameIdAndMemberId = vi.fn();
        this.create = vi.fn();
    }),
}));

vi.mock("@/backend/game/infra/repositories/prisma/GamePrismaRepository", () => ({
    GamePrismaRepository: vi.fn(function (this: Record<string, unknown>) {
        this.findById = vi.fn();
    }),
}));

vi.mock("@/backend/review/infra/repositories/prisma/PrismaReviewRepository", () => ({
    PrismaReviewRepository: vi.fn(function (this: Record<string, unknown>) {
        this.findByMemberId = vi.fn();
    }),
}));

vi.mock("@/backend/wishlist/application/usecase/GetWishlistUsecase", () => ({
    GetWishlistUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue({ gameId: 1, memberId: "test-member-id" });
    }),
}));

vi.mock("@/backend/wishlist/application/usecase/GetWishlistsUsecase", () => ({
    GetWishlistsUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue([]);
    }),
}));

vi.mock("@/backend/wishlist/application/usecase/CreateWishlistUsecase", () => ({
    CreateWishlistUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(42);
    }),
}));

import { GET, POST } from "../route";

describe("GET /api/member/wishlists", () => {
    it("returns 401 when not authenticated", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

        const req = new NextRequest("http://localhost/api/member/wishlists");
        const response = await GET(req);
        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 400 when gameId is not a number", async () => {
        const req = new NextRequest("http://localhost/api/member/wishlists?gameId=abc");
        const response = await GET(req);
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 200 with single wishlist when gameId provided", async () => {
        const req = new NextRequest("http://localhost/api/member/wishlists?gameId=1");
        const response = await GET(req);
        expect(response.status).toBe(200);
    });

    it("returns 200 with wishlist list when no gameId", async () => {
        const req = new NextRequest("http://localhost/api/member/wishlists");
        const response = await GET(req);
        expect(response.status).toBe(200);
    });

    it("returns 500 when usecase throws", async () => {
        const { GetWishlistsUsecase } = await import(
            "@/backend/wishlist/application/usecase/GetWishlistsUsecase"
        );
        vi.mocked(GetWishlistsUsecase).mockImplementationOnce(
            function (this: Record<string, unknown>) {
                this.execute = vi.fn().mockRejectedValue(new Error("DB error"));
            } as unknown as typeof GetWishlistsUsecase
        );

        const req = new NextRequest("http://localhost/api/member/wishlists");
        const response = await GET(req);
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });
});

describe("POST /api/member/wishlists", () => {
    it("returns 401 when not authenticated", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

        const req = new NextRequest("http://localhost/api/member/wishlists", {
            method: "POST",
            body: JSON.stringify({ gameId: 1 }),
            headers: { "Content-Type": "application/json" },
        });
        const response = await POST(req);
        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 200 with wishlistId on success", async () => {
        const req = new NextRequest("http://localhost/api/member/wishlists", {
            method: "POST",
            body: JSON.stringify({ gameId: 1 }),
            headers: { "Content-Type": "application/json" },
        });
        const response = await POST(req);
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty("wishlistId", 42);
    });

    it("returns 400 when usecase throws", async () => {
        const { CreateWishlistUsecase } = await import(
            "@/backend/wishlist/application/usecase/CreateWishlistUsecase"
        );
        vi.mocked(CreateWishlistUsecase).mockImplementationOnce(
            function (this: Record<string, unknown>) {
                this.execute = vi.fn().mockRejectedValue(new Error("Already exists"));
            } as unknown as typeof CreateWishlistUsecase
        );

        const req = new NextRequest("http://localhost/api/member/wishlists", {
            method: "POST",
            body: JSON.stringify({ gameId: 1 }),
            headers: { "Content-Type": "application/json" },
        });
        const response = await POST(req);
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });
});
