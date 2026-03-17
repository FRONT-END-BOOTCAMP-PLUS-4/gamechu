import { test, expect } from "@playwright/test";

function collectConsoleErrors(page: import("@playwright/test").Page): string[] {
    const errors: string[] = [];
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
    });
    return errors;
}

test("홈페이지 로드 및 콘솔 에러 없음", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
    expect(errors).toHaveLength(0);
});

test("/log-in 페이지 콘솔 에러 없음", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto("/log-in");
    await expect(page.locator("body")).toBeVisible();
    expect(errors).toHaveLength(0);
});

test("/sign-up 페이지 콘솔 에러 없음", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto("/sign-up");
    await expect(page.locator("body")).toBeVisible();
    expect(errors).toHaveLength(0);
});
