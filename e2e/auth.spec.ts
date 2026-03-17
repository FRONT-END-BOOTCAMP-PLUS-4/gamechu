import { test, expect } from "@playwright/test";

test("/log-in 페이지 폼 렌더링", async ({ page }) => {
    await page.goto("/log-in");

    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
});
