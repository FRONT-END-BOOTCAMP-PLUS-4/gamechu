import { test, expect } from "@playwright/test";

test("/log-in 페이지 폼 렌더링", async ({ page }) => {
    await page.goto("/log-in");

    await expect(
        page.getByRole("textbox", { name: "이메일 주소를 입력하세요" })
    ).toBeVisible();
    await expect(
        page.getByRole("textbox", { name: "비밀번호를 입력하세요" })
    ).toBeVisible();
});

test("/sign-up 페이지 단계 UI 렌더링", async ({ page }) => {
    await page.goto("/sign-up");

    // 페이지 제목
    await expect(page.getByText("회원 정보를 입력해주세요")).toBeVisible();

    // 진행 단계 표시 (1/4)
    await expect(page.getByText(/1\/4 진행중/)).toBeVisible();

    // 진행 바 존재
    await expect(page.locator("div.bg-primary-purple-200")).toBeVisible();
});
