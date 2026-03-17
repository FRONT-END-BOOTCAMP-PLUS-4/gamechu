import { test, expect } from "@playwright/test";

test("GET /api/games — 500 아님", async ({ request }) => {
    const response = await request.get("/api/games");
    expect(response.status()).not.toBe(500);
});

test("GET /api/arenas — 500 아님", async ({ request }) => {
    const response = await request.get("/api/arenas");
    expect(response.status()).not.toBe(500);
});
