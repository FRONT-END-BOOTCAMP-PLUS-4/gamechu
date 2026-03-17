import { test, expect } from "@playwright/test";

test("홈페이지 로드 및 콘솔 에러 없음", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
        if (msg.type() === "error") {
            consoleErrors.push(msg.text());
        }
    });

    await page.goto("/");

    await expect(page).toHaveTitle(/.+/);
    expect(consoleErrors).toHaveLength(0);
});
