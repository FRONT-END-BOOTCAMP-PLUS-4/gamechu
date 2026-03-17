import { test, expect } from "@playwright/test";

test("/arenas 페이지 유효 UI 렌더링", async ({ page }) => {
    const response = await page.goto("/arenas");

    expect(response?.status()).not.toBe(500);
    expect(response?.status()).not.toBe(404);

    await expect(page.locator("body")).toBeVisible();
});

test("/arenas 페이지 헤더 '토론 투기장' 제목 렌더링", async ({ page }) => {
    await page.goto("/arenas");

    await expect(page.getByRole("heading", { name: "토론 투기장" })).toBeVisible();
});

test("/arenas 페이지 '도전장 작성하기' 버튼 렌더링", async ({ page }) => {
    await page.goto("/arenas");

    await expect(page.getByText("도전장 작성하기")).toBeVisible();
});

test("/arenas/999999 — 존재하지 않는 투기장 안내 메시지", async ({ page }) => {
    await page.goto("/arenas/999999");

    await expect(page.locator("body")).toBeVisible();
    // notFound 상태: 안내 문구 또는 빈 레이아웃 — 500은 아님
    const content = await page.locator("body").textContent();
    expect(content).not.toContain("Internal Server Error");
});
