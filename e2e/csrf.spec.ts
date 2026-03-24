import { test, expect } from "@playwright/test";

test("POST /api/member/attend with cross-origin Origin → 403", async ({ request }) => {
    const response = await request.post("/api/member/attend", {
        headers: { origin: "https://evil.com" },
    });
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.message).toBe("Forbidden");
});

test("POST /api/member/attend with same-origin Origin → not 403", async ({ request, baseURL }) => {
    const response = await request.post("/api/member/attend", {
        headers: { origin: baseURL },
    });
    expect(response.status()).not.toBe(403);
    // Expect 401 (unauthenticated) — confirms CSRF check passed and auth check ran
    expect(response.status()).toBe(401);
});

test("POST /api/member/attend with null-origin (sandboxed iframe) → 403", async ({ request }) => {
    const response = await request.post("/api/member/attend", {
        headers: { origin: "null" },
    });
    expect(response.status()).toBe(403);
});
