import { test, expect } from "@playwright/test";

// --- Public endpoints: 500 아님 ---

test("GET /api/games — 500 아님", async ({ request }) => {
    const response = await request.get("/api/games");
    expect(response.status()).not.toBe(500);
});

test("GET /api/arenas — 500 아님", async ({ request }) => {
    const response = await request.get("/api/arenas");
    expect(response.status()).not.toBe(500);
});

test("GET /api/genres — 500 아님", async ({ request }) => {
    const response = await request.get("/api/genres");
    expect(response.status()).not.toBe(500);
});

test("GET /api/platforms — 500 아님", async ({ request }) => {
    const response = await request.get("/api/platforms");
    expect(response.status()).not.toBe(500);
});

test("GET /api/themes — 500 아님", async ({ request }) => {
    const response = await request.get("/api/themes");
    expect(response.status()).not.toBe(500);
});

// --- Auth-protected endpoints: 401 반환 확인 (500이면 auth 체크 누락 또는 충돌) ---

test("GET /api/member/profile — 미인증 시 401", async ({ request }) => {
    const response = await request.get("/api/member/profile");
    expect(response.status()).toBe(401);
});

test("GET /api/member/wishlists — 미인증 시 401", async ({ request }) => {
    const response = await request.get("/api/member/wishlists");
    expect(response.status()).toBe(401);
});

test("GET /api/member/scores — 미인증 시 401", async ({ request }) => {
    const response = await request.get("/api/member/scores");
    expect(response.status()).toBe(401);
});

test("GET /api/member/notification-records — 미인증 시 401", async ({ request }) => {
    const response = await request.get("/api/member/notification-records");
    expect(response.status()).toBe(401);
});
