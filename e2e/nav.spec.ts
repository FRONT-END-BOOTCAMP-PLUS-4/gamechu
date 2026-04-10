import { test, expect } from "@playwright/test";

test("홈 '게임 탐색' 카드 → /games 이동", async ({ page }) => {
    await page.goto("/");

    // header nav에도 "게임" 링크가 있으므로 main 영역으로 범위 제한
    await page
        .locator("main")
        .getByRole("link", { name: /게임 탐색/ })
        .click();

    await expect(page).toHaveURL(/\/games/);
    await expect(
        page.getByRole("heading", { name: "게임 탐색" })
    ).toBeVisible();
});

test("홈 '투기장' 카드 → /arenas 이동", async ({ page }) => {
    await page.goto("/");

    // header nav에도 "투기장" 링크가 있으므로 main 영역으로 범위 제한
    await page
        .locator("main")
        .getByRole("link", { name: /투기장/ })
        .click();

    await expect(page).toHaveURL(/\/arenas/);
    await expect(
        page.getByRole("heading", { name: "토론 투기장" })
    ).toBeVisible();
});
