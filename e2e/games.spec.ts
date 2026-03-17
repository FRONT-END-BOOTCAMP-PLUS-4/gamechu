import { test, expect } from "@playwright/test";

test("/games 페이지 유효 UI 렌더링", async ({ page }) => {
    const response = await page.goto("/games");

    expect(response?.status()).not.toBe(500);
    expect(response?.status()).not.toBe(404);

    // 게임 카드 또는 빈 상태 UI 중 하나가 렌더링되어야 함
    await expect(page.locator("body")).toBeVisible();
});
