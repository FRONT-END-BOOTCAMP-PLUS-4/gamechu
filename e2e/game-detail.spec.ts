import { test, expect } from "@playwright/test";

const GAME_URL = "/games/115";

/** 페이지 이동 + 리뷰 API 응답 대기 (waitForResponse는 goto 전 등록 필요) */
async function gotoAndWaitForReviews(page: import("@playwright/test").Page) {
    const responsePromise = page.waitForResponse(
        (resp) =>
            resp.url().includes("/api/games/115/reviews") &&
            resp.status() === 200
    );
    await page.goto(GAME_URL);
    await responsePromise;
}

// ─── 5-A: 페이지 기본 렌더링 ───────────────────────────────────────────────

test("5-A: /games/115 정상 로드 (500/404 없음)", async ({ page }) => {
    const response = await page.goto(GAME_URL);
    expect(response?.status()).not.toBe(500);
    expect(response?.status()).not.toBe(404);
});

test("5-A: 게임 제목 h2 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(
        page.getByRole("heading", { name: "League of Legends", level: 2 })
    ).toBeVisible();
});

test("5-A: 개발사 텍스트 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    // 레이아웃이 lg:hidden(모바일)과 hidden.lg:flex(데스크탑)으로 이중 렌더링됨.
    // 1280px 뷰포트에서 모바일 layout은 display:none → .nth(1)이 데스크탑(visible)
    await expect(page.getByText("Riot Games").nth(1)).toBeVisible();
});

test("5-A: 평점 영역 '겜잘알 평점' 라벨 및 값 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.getByText("겜잘알 평점").nth(1)).toBeVisible();
});

test("5-A: 평점 X.X / 5.0 텍스트 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.getByText(/\d+\.\d+ \/ 5\.0/).nth(1)).toBeVisible();
});

test("5-A: '출시일' 라벨 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.getByText("출시일").nth(1)).toBeVisible();
});

// ─── 5-B: GameInfoCard ─────────────────────────────────────────────────────

test("5-B: '게임 정보' heading visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(
        page.getByRole("heading", { name: "게임 정보" })
    ).toBeVisible();
});

test("5-B: GameInfoCard '플랫폼' 라벨 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    // GameInfoCard도 이중 렌더링 — .nth(1)이 데스크탑(visible)
    await expect(page.getByText("플랫폼").nth(1)).toBeVisible();
});

test("5-B: GameInfoCard '장르' 라벨 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.getByText("장르").nth(1)).toBeVisible();
});

test("5-B: GameInfoCard '테마' 라벨 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.getByText("테마").nth(1)).toBeVisible();
});

test("5-B: GameInfoCard '위시' 라벨 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.getByText("위시").nth(1)).toBeVisible();
});

test("5-B: GameInfoCard '리뷰' 라벨 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.getByText("리뷰").nth(1)).toBeVisible();
});

// ─── 5-C: ReviewSelector ──────────────────────────────────────────────────

test("5-C: '겜잘알 리뷰' 버튼 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(
        page.getByRole("button", { name: /겜잘알 리뷰/ })
    ).toBeVisible();
});

test("5-C: '일반 리뷰' 버튼 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(
        page.getByRole("button", { name: /일반 리뷰/ })
    ).toBeVisible();
});

test("5-C: 기본 선택은 '겜잘알 리뷰' (border-primary-purple-200 클래스)", async ({
    page,
}) => {
    await page.goto(GAME_URL);
    const expertBtn = page.getByRole("button", { name: /겜잘알 리뷰/ });
    await expect(expertBtn).toHaveClass(/border-primary-purple-200/);
});

test("5-C: '일반 리뷰' 클릭 시 해당 버튼 active 전환", async ({ page }) => {
    await page.goto(GAME_URL);
    const userBtn = page.getByRole("button", { name: /일반 리뷰/ });
    await userBtn.click();
    await expect(userBtn).toHaveClass(/border-primary-purple-200/);
});

test("5-C: 리뷰 로드 후 '겜잘알 리뷰' 버튼 카운트 표시", async ({ page }) => {
    await gotoAndWaitForReviews(page);
    // 카운트가 숫자로 업데이트됨 (0이 아닌 숫자 포함)
    await expect(
        page.getByRole("button", { name: /겜잘알 리뷰 별 \d/ })
    ).toBeVisible();
});

// ─── 5-D: Lexical 에디터 (비인증) ─────────────────────────────────────────

test("5-D: 에디터 ContentEditable visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.getByRole("textbox").first()).toBeVisible();
});

test("5-D: 플레이스홀더 '리뷰를 입력하세요...' visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.getByText("리뷰를 입력하세요...")).toBeVisible();
});

test("5-D: 툴바 Row1 버튼 모두 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    const toolbarButtons = [
        "실행 취소",
        "다시 실행",
        "굵게",
        "기울임",
        "밑줄",
        "취소선",
        "제목 1",
        "제목 2",
        "제목 3",
        "글머리 기호 목록",
        "번호 매기기 목록",
        "인용구",
    ];
    for (const label of toolbarButtons) {
        await expect(page.getByRole("button", { name: label })).toBeVisible();
    }
});

test("5-D: 툴바 Row2 — 글자 크기 select, 사진, 초기화 버튼 visible", async ({
    page,
}) => {
    await page.goto(GAME_URL);
    await expect(page.getByRole("combobox", { name: "글자 크기" })).toBeVisible();
    await expect(page.getByRole("button", { name: "사진 업로드" })).toBeVisible();
    await expect(page.getByRole("button", { name: "에디터 초기화" })).toBeVisible();
});

test("5-D: 글자 수 카운터 '0 / 10,000' visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.getByText("0 / 10,000")).toBeVisible();
});

test("5-D: 별점 컴포넌트(StarRating) — 5개 empty 별 visible", async ({
    page,
}) => {
    await page.goto(GAME_URL);
    const stars = page.locator('img[alt="empty"]');
    await expect(stars.first()).toBeVisible();
    expect(await stars.count()).toBe(5);
});

test("5-D: '등록' 버튼 visible", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.getByRole("button", { name: "등록" })).toBeVisible();
});

test("5-D: 비인증 '등록' 클릭 → '로그인이 필요합니다' toast 후 /log-in 이동", async ({
    page,
}) => {
    await page.goto(GAME_URL);
    await page.getByRole("button", { name: "등록" }).click();
    await expect(page.getByText("로그인이 필요합니다")).toBeVisible();
    await page.waitForURL(/\/log-in/);
    expect(page.url()).toContain("/log-in");
});

// ─── 5-E: 에디터 인터랙션 (비인증) ────────────────────────────────────────

test("5-E: 에디터 타이핑 → 글자 수 카운터 증가", async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.getByText("0 / 10,000")).toBeVisible();
    await page.getByRole("textbox").first().click();
    await page.keyboard.type("안녕하세요");
    await expect(page.getByText("0 / 10,000")).not.toBeVisible();
    await expect(page.getByText(/^[1-9]\d* \/ 10,000$/)).toBeVisible();
});

test("5-E: URL 타이핑 후 공백 → AutoLink 자동 변환 (anchor 생성)", async ({
    page,
}) => {
    await page.goto(GAME_URL);
    const editor = page.getByRole("textbox").first();
    await editor.click();
    await page.keyboard.type("https://example.com ");
    await expect(
        page.locator('[contenteditable="true"] a[href="https://example.com"]')
    ).toBeVisible();
});

test("5-E: 초기화(Trash) 버튼 클릭 → confirm 다이얼로그 표시", async ({
    page,
}) => {
    await page.goto(GAME_URL);
    let dialogShown = false;
    page.on("dialog", async (dialog) => {
        dialogShown = true;
        expect(dialog.message()).toContain("삭제");
        await dialog.dismiss();
    });
    await page.getByRole("button", { name: "에디터 초기화" }).click();
    expect(dialogShown).toBe(true);
});

// ─── 5-F: CommentCard 렌더링 ──────────────────────────────────────────────

test("5-F: CommentCard — 닉네임, 날짜, 별점 visible (리뷰 로드 후)", async ({
    page,
}) => {
    await gotoAndWaitForReviews(page);
    // 겜잘알 리뷰 탭 기준 (기본 선택) — Roast가 겜잘알(score 7920)
    await expect(page.getByText("Roast")).toBeVisible();
    await expect(page.getByText(/\d{4}\. \d+\. \d+\./)).toBeVisible();
    // 별점 표시
    await expect(page.locator('img[alt="star"]')).toBeVisible();
});

test("5-F: CommentCard — 좋아요 버튼 및 카운트 visible", async ({ page }) => {
    await gotoAndWaitForReviews(page);
    // 좋아요 버튼 (like 이미지)
    await expect(page.locator('img[alt="like"]')).toBeVisible();
});

test("5-F: '일반 리뷰' 탭 클릭 시 유저 리뷰 로드", async ({ page }) => {
    await gotoAndWaitForReviews(page);
    const nextResponsePromise = page.waitForResponse(
        (resp) =>
            resp.url().includes("/api/games/115/reviews") &&
            resp.status() === 200
    );
    await page.getByRole("button", { name: /일반 리뷰/ }).click();
    await nextResponsePromise;
    // 일반 리뷰 버튼이 active 상태로 전환
    await expect(
        page.getByRole("button", { name: /일반 리뷰/ })
    ).toHaveClass(/border-primary-purple-200/);
});

// ─── 5-G: 페이지네이션 ────────────────────────────────────────────────────

test("5-G: Pager 컴포넌트 visible (리뷰 1개 이상 시)", async ({ page }) => {
    await gotoAndWaitForReviews(page);
    // Pager는 1페이지 이상 리뷰 있을 때 표시
    await expect(page.getByText(/Page \d+ of \d+/i)).toBeVisible();
});

test("5-G: 리뷰 5개 이상 시 2페이지 클릭 → 다른 리뷰 렌더링", async ({
    page,
}) => {
    await gotoAndWaitForReviews(page);
    // Switch to 일반 리뷰 (6 reviews, 2 pages)
    const nextResp = page.waitForResponse(
        (r) => r.url().includes("/api/games/115/reviews") && r.status() === 200
    );
    await page.getByRole("button", { name: /일반 리뷰/ }).click();
    await nextResp;

    const page2Btn = page.getByRole("button", { name: "2", exact: true });
    if (!(await page2Btn.count())) return; // 2페이지 없으면 스킵

    // nth(0) = Lexical editor (always empty), nth(1) = first CommentCard
    const firstCardText = await page
        .locator('[role="textbox"]')
        .nth(1)
        .innerText();
    await page2Btn.click();
    const secondCardText = await page
        .locator('[role="textbox"]')
        .nth(1)
        .innerText();
    expect(secondCardText).not.toBe(firstCardText);
});

test("5-G: 2페이지 → 1페이지 돌아오기", async ({ page }) => {
    await gotoAndWaitForReviews(page);
    const nextResp = page.waitForResponse(
        (r) => r.url().includes("/api/games/115/reviews") && r.status() === 200
    );
    await page.getByRole("button", { name: /일반 리뷰/ }).click();
    await nextResp;

    const page2Btn = page.getByRole("button", { name: "2", exact: true });
    if (!(await page2Btn.count())) return;

    await page2Btn.click();
    await expect(page.getByText("Page 2 of 2")).toBeVisible();

    await page.getByRole("button", { name: "1", exact: true }).click();
    await expect(page.getByText("Page 1 of 2")).toBeVisible();
});

// ─── 5-F: 더보기/접기 ────────────────────────────────────────────────────────

test("5-F: 더보기 클릭 → 콘텐츠 확장 + 접기 버튼 전환", async ({ page }) => {
    await gotoAndWaitForReviews(page);
    const nextResp = page.waitForResponse(
        (r) => r.url().includes("/api/games/115/reviews") && r.status() === 200
    );
    await page.getByRole("button", { name: /일반 리뷰/ }).click();
    await nextResp;

    // 더보기 버튼은 page 2에 있음 (친절한이웃스파이의 긴 리뷰)
    await page.getByRole("button", { name: "2", exact: true }).click();
    const moreBtnLocator = page.getByRole("button", { name: "더보기" });
    await expect(moreBtnLocator).toBeVisible();

    await moreBtnLocator.click();
    await expect(page.getByRole("button", { name: "접기" })).toBeVisible();
    await expect(moreBtnLocator).not.toBeVisible();
});

test("5-F: 접기 클릭 → 콘텐츠 다시 접힘", async ({ page }) => {
    await gotoAndWaitForReviews(page);
    const nextResp = page.waitForResponse(
        (r) => r.url().includes("/api/games/115/reviews") && r.status() === 200
    );
    await page.getByRole("button", { name: /일반 리뷰/ }).click();
    await nextResp;

    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "더보기" }).click();
    await expect(page.getByRole("button", { name: "접기" })).toBeVisible();

    await page.getByRole("button", { name: "접기" }).click();
    await expect(page.getByRole("button", { name: "더보기" })).toBeVisible();
    await expect(page.getByRole("button", { name: "접기" })).not.toBeVisible();
});
