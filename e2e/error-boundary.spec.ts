import { test, expect } from "@playwright/test";

test.describe("에러 바운더리", () => {
    test("에러 발생 시 SYSTEM ERROR 배지와 버튼이 표시된다", async ({ page }) => {
        await page.goto("/test-error");

        // SYSTEM ERROR 배지
        await expect(page.getByText("SYSTEM ERROR")).toBeVisible();

        // 버튼 두 개
        await expect(page.getByRole("button", { name: /다시 시도/ })).toBeVisible();
        await expect(page.getByRole("button", { name: /홈으로/ })).toBeVisible();
    });

    test("홈으로 버튼 클릭 시 홈으로 이동한다", async ({ page }) => {
        await page.goto("/test-error");
        await expect(page.getByText("SYSTEM ERROR")).toBeVisible();

        await page.getByRole("button", { name: /홈으로/ }).click();
        await expect(page).toHaveURL("/");
    });

    test("다시 시도 버튼 클릭 시 에러 바운더리가 재실행된다", async ({ page }) => {
        await page.goto("/test-error");
        await expect(page.getByText("SYSTEM ERROR")).toBeVisible();

        // test-error 페이지는 항상 throw하므로 reset 후에도 배지가 다시 표시됨
        await page.getByRole("button", { name: /다시 시도/ }).click();
        await expect(page.getByText("SYSTEM ERROR")).toBeVisible();
    });

    test("5초 후 자동으로 홈으로 이동한다", async ({ page }) => {
        // clock.install()은 반드시 goto() 전에 호출해야 setTimeout이 fake clock에 등록됨
        await page.clock.install();
        await page.goto("/test-error");
        await expect(page.getByText("SYSTEM ERROR")).toBeVisible();

        await page.clock.fastForward(5000);
        await expect(page).toHaveURL("/");
    });
});
