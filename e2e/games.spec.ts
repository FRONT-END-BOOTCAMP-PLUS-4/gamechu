import { test, expect } from "@playwright/test";

test("/games 페이지 유효 UI 렌더링", async ({ page }) => {
    const response = await page.goto("/games");

    expect(response?.status()).not.toBe(500);
    expect(response?.status()).not.toBe(404);

    await expect(page.locator("body")).toBeVisible();
});

test("/games 페이지 헤더 '게임 탐색' 제목 렌더링", async ({ page }) => {
    await page.goto("/games");

    await expect(page.getByRole("heading", { name: "게임 탐색" })).toBeVisible();
});

test("/games 페이지 검색창 렌더링", async ({ page }) => {
    await page.goto("/games");

    await expect(page.getByRole("textbox", { name: "제목 또는 개발사 검색 (영문)" })).toBeVisible();
});

test("/games 페이지 게임 필터 버튼 렌더링", async ({ page }) => {
    await page.goto("/games");

    await expect(page.getByText("게임 필터")).toBeVisible();
});
