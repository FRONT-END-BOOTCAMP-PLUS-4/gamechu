/**
 * 5-H: 인증 필요 항목 — game-detail 페이지 E2E
 *
 * 실행 조건:
 *   E2E_EMAIL, E2E_PASSWORD 환경변수 설정 후 `npm run test:e2e` 실행.
 *   playwright.config.ts의 "authenticated" 프로젝트가 auth.setup.ts를 먼저 실행해
 *   e2e/.auth/user.json에 세션 쿠키를 저장하고 이 파일에 주입합니다.
 */

import { test, expect } from "@playwright/test";

const GAME_URL = "/games/115";
const hasAuth = !!(process.env.E2E_EMAIL && process.env.E2E_PASSWORD);

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Navigate to the game page and wait for the editor to be interactive.
 *
 * Handles two page states:
 *   (a) No existing review → Comment editor is shown immediately (create mode).
 *   (b) User has an existing review → CommentCard is shown; clicks "수정" to
 *       enter edit mode so the toolbar becomes available.
 */
async function gotoAndWaitForEditor(page: import("@playwright/test").Page) {
    // Register listener BEFORE navigation to capture the reviews fetch.
    const reviewsFetchDone = page
        .waitForResponse(
            (resp) => resp.url().includes("/api/games/115/reviews"),
            { timeout: 25_000 }
        )
        .catch(() => null);

    await page.goto(GAME_URL);
    await reviewsFetchDone; // reviews API responded; React still needs to render

    // Wait for React to render: either the user's CommentCard (.glow-border) or the
    // create-mode editor appears. isVisible() has no wait — use waitFor instead.
    let hasExistingReview = false;
    try {
        await page.locator(".glow-border").waitFor({ state: "visible", timeout: 8_000 });
        hasExistingReview = true;
    } catch {
        hasExistingReview = false;
    }

    if (hasExistingReview) {
        // Click the MoreVertical menu button on the user's card
        await page
            .locator(".glow-border button.rounded-lg.p-2")
            .first()
            .click();
        await page.getByRole("button", { name: "수정" }).click();
        // Let Lexical fully initialize the edit-mode editor
        await page.waitForTimeout(1_000);
    }

    await expect(page.getByRole("button", { name: "굵게" })).toBeVisible({
        timeout: 15_000,
    });
}

/**
 * Navigate to the game page and wait for the user's CommentCard to be visible.
 * Used by tests that need to interact with the existing CommentCard (수정/삭제).
 */
async function gotoAndWaitForCommentCard(
    page: import("@playwright/test").Page
) {
    const reviewsFetchDone = page
        .waitForResponse(
            (resp) => resp.url().includes("/api/games/115/reviews"),
            { timeout: 25_000 }
        )
        .catch(() => null);

    await page.goto(GAME_URL);
    await reviewsFetchDone;

    await expect(page.locator(".glow-border")).toBeVisible({ timeout: 15_000 });
}

/** Click the nth star (0-indexed) in the Comment editor star rating. */
async function clickStar(
    page: import("@playwright/test").Page,
    index: number
) {
    // Stars are in the flex-shrink-0 container alongside the submit button.
    // cursor-pointer distinguishes editable stars from read-only ones.
    const starDivs = page
        .locator("div.flex-shrink-0")
        .locator(".h-\\[30px\\].w-\\[30px\\].cursor-pointer");
    await starDivs.nth(index).click();
}

/**
 * Navigate to the game page in CREATE mode (no existing review).
 * If a review exists, deletes it first so the editor starts fresh.
 * Used by formatting tests — fill() + click() only works reliably in create mode.
 */
async function gotoForFormatTest(page: import("@playwright/test").Page) {
    const reviewsFetchDone = page
        .waitForResponse(
            (resp) => resp.url().includes("/api/games/115/reviews"),
            { timeout: 25_000 }
        )
        .catch(() => null);

    await page.goto(GAME_URL);
    await reviewsFetchDone;

    let hasExistingReview = false;
    try {
        await page.locator(".glow-border").waitFor({ state: "visible", timeout: 8_000 });
        hasExistingReview = true;
    } catch {
        hasExistingReview = false;
    }

    if (hasExistingReview) {
        // Delete the existing review so we land in create mode
        page.once("dialog", (dialog) => dialog.accept());
        await page.locator(".glow-border button.rounded-lg.p-2").first().click();

        const deleteResponse = page.waitForResponse(
            (resp) =>
                resp.url().includes("/api/member/games/115/reviews/") &&
                resp.request().method() === "DELETE" &&
                resp.status() === 200,
            { timeout: 20_000 }
        );
        await page.getByRole("button", { name: "삭제" }).click();
        await deleteResponse;
    }

    await expect(page.getByRole("button", { name: "굵게" })).toBeVisible({
        timeout: 15_000,
    });
}

// ─── 5-H: 인증 필요 항목 ──────────────────────────────────────────────────────

test("5-H: 로그인 상태에서 별점 미선택 → '별점을 선택해주세요' toast (B1)", async ({
    page,
}) => {
    test.skip(!hasAuth, "E2E_EMAIL, E2E_PASSWORD 환경변수 설정 필요");
    test.setTimeout(60_000);

    // gotoAndWaitForEditor: 페이지가 안정화된 후 editor 보장
    // (기존 리뷰가 있으면 edit mode로 전환, 없으면 create mode 유지)
    await gotoAndWaitForEditor(page);

    // 에디터에 텍스트 입력 (내용은 있되 별점 없음)
    const editor = page.getByRole("textbox").first();
    await editor.click();
    await page.keyboard.type("테스트 리뷰 내용");
    // 별점 미선택 상태로 제출 (create mode: "등록", edit mode: "수정")
    await page.getByRole("button", { name: /등록|수정/ }).click();
    await expect(page.getByText("별점을 선택해주세요")).toBeVisible();
});

test("5-H: 리뷰 제출 → CommentCard 렌더링 확인", async ({ page }) => {
    test.skip(!hasAuth, "E2E_EMAIL, E2E_PASSWORD 환경변수 설정 필요");
    test.setTimeout(90_000);

    const reviewText = `E2E 테스트 리뷰 ${Date.now()}`;

    await gotoAndWaitForEditor(page);

    // 텍스트 입력
    const editor = page.getByRole("textbox").first();
    await editor.click();
    // 기존 내용이 있을 경우 덮어쓰기
    await page.keyboard.press("Control+a");
    await page.keyboard.type(reviewText);

    // 별점 선택 (5번째 별 → 5점)
    await clickStar(page, 4);

    // 제출
    const reviewsResponse = page.waitForResponse(
        (resp) =>
            resp.url().includes("/api/member/games/115/reviews") &&
            (resp.status() === 201 || resp.status() === 200),
        { timeout: 30_000 }
    );
    await page.getByRole("button", { name: /등록|수정/ }).click();
    await reviewsResponse;

    // 새 CommentCard가 렌더링됐는지 확인
    await expect(page.getByText(reviewText)).toBeVisible({ timeout: 15_000 });
});

test("5-H: H1 서식 저장 → ReadOnlyReview heading 스타일 반영 (B5)", async ({
    page,
}) => {
    test.skip(!hasAuth, "E2E_EMAIL, E2E_PASSWORD 환경변수 설정 필요");
    test.setTimeout(90_000);

    // Ensure create mode: fill() + click() only works reliably in an empty editor
    await gotoForFormatTest(page);

    const editor = page.getByRole("textbox").first();
    await editor.fill("H1 서식 테스트");
    await page.keyboard.press("Control+a");
    await page.getByRole("button", { name: "제목 1" }).click();

    await clickStar(page, 2); // 3번째 별

    const reviewsResponse = page.waitForResponse(
        (resp) =>
            resp.url().includes("/api/member/games/115/reviews") &&
            (resp.status() === 201 || resp.status() === 200),
        { timeout: 30_000 }
    );
    await page.getByRole("button", { name: /등록|수정/ }).click();
    await reviewsResponse;

    // ReadOnlyReview에서 사용자 카드(.glow-border) 내 h1 태그 렌더링 확인
    await expect(page.locator(".glow-border h1")).toBeVisible({
        timeout: 15_000,
    });
});

test("5-H: 굵게/기울임/밑줄 서식 저장 → ReadOnlyReview 스타일 반영", async ({
    page,
}) => {
    test.skip(!hasAuth, "E2E_EMAIL, E2E_PASSWORD 환경변수 설정 필요");
    test.setTimeout(90_000);

    // Ensure create mode: fill() + click() only works reliably in an empty editor
    await gotoForFormatTest(page);

    const editor = page.getByRole("textbox").first();
    await editor.fill("굵게 서식 테스트");
    await page.keyboard.press("Control+a");
    await page.getByRole("button", { name: "굵게" }).click();

    await clickStar(page, 1); // 2번째 별

    const reviewsResponse = page.waitForResponse(
        (resp) =>
            resp.url().includes("/api/member/games/115/reviews") &&
            (resp.status() === 201 || resp.status() === 200),
        { timeout: 30_000 }
    );
    await page.getByRole("button", { name: /등록|수정/ }).click();
    await reviewsResponse;

    // ReadOnlyReview에서 사용자 카드(.glow-border) 내 strong 태그 렌더링 확인
    await expect(page.locator(".glow-border strong")).toBeVisible({
        timeout: 15_000,
    });
});

test("5-H: 내 댓글 수정 클릭 → Comment 에디터 전환 + 기존 내용 로드", async ({
    page,
}) => {
    test.skip(!hasAuth, "E2E_EMAIL, E2E_PASSWORD 환경변수 설정 필요");
    test.setTimeout(60_000);

    await gotoAndWaitForCommentCard(page);

    // MoreVertical 메뉴 열기
    await page
        .locator(".glow-border button.rounded-lg.p-2")
        .first()
        .click();

    // "수정" 버튼 클릭
    await page.getByRole("button", { name: "수정" }).click();

    // Comment 에디터가 편집 모드로 전환됐는지 확인 (submit 버튼 라벨 "수정")
    await expect(
        page.getByRole("button", { name: "수정", exact: true }).last()
    ).toBeVisible({ timeout: 10_000 });

    // 에디터에 기존 내용이 로드됐는지 확인
    const editorContent = await page
        .getByRole("textbox")
        .first()
        .innerText();
    expect(editorContent.trim().length).toBeGreaterThan(0);
});

test("5-H: 내 댓글 삭제 → confirm → CommentCard 사라짐", async ({ page }) => {
    test.skip(!hasAuth, "E2E_EMAIL, E2E_PASSWORD 환경변수 설정 필요");
    test.setTimeout(60_000);

    await gotoAndWaitForCommentCard(page);

    // confirm 다이얼로그 자동 수락
    page.on("dialog", (dialog) => dialog.accept());

    // MoreVertical 메뉴 열기
    await page
        .locator(".glow-border button.rounded-lg.p-2")
        .first()
        .click();

    const deleteResponse = page.waitForResponse(
        (resp) =>
            resp.url().includes("/api/member/games/115/reviews/") &&
            resp.request().method() === "DELETE" &&
            resp.status() === 200
    );

    await page.getByRole("button", { name: "삭제" }).click();
    await deleteResponse;

    // 삭제 후 glow-border가 사라졌는지 확인
    await expect(page.locator(".glow-border")).not.toBeVisible({
        timeout: 10_000,
    });
});
