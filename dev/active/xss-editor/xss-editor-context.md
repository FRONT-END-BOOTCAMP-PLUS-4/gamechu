# XSS 에디터 개선 — 컨텍스트

> Last Updated: 2026-03-21 (세션 11 — /dev-docs-update 컨텍스트 캡처)
> Branch: `fix/#266`
> **Status**: Phase 1-4 완료, 5-A~5-H 전체 [x]. 5-F "더보기 visible" 항목은 코드 확인만 (브라우저 미확인). 5-G "2페이지 클릭"은 조건부 스킵. NEXT STEP: 리뷰 3개 시딩 → E2E 재확인 → commit + PR

---

## 현재 구현 상태

### Phase 1-4: 완료

모든 XSS 취약점 구조적으로 제거됨. `next build` 성공. 테스트 142개 통과.

### Phase 5-H E2E 테스트: 7/7 전체 통과 ✅ (세션 9 기준)

파일: `e2e/game-detail-auth.spec.ts` + `e2e/auth.setup.ts`

**전체 통과 (7)**: setup(auth), B1 별점 toast, 리뷰 제출, H1 서식, 굵게 서식, 수정 클릭, 삭제

### Phase 5-F/5-G 상태: 데이터 의존 (세션 10 기준)

- 5-F(더보기/접기): 긴 리뷰 1개 필요 (scrollHeight > 180px)
- 5-G(pagination): 리뷰 5개 이상 필요 (현재 game 115에 2개)
- **현재 DB**: Member 6명 (테스트1, 건강박수짝짝, 친절한이웃스파이, test2, 입체기동장치, Roast), game 115 리뷰 2개 (Roast id=2, 친절한이웃스파이 id=4)
- **시딩 방법**: Prisma `$queryRaw` 또는 tsx 스크립트로 직접 INSERT — psql 명령줄 방식 사용자 거부됨

---

### 세션 9 수정 내역 — H1/bold E2E 통과

**핵심 발견**: Lexical edit mode에서 toolbar 버튼 클릭 실패 원인 = editor mode 문제였음 (headless/click 방식 문제가 아님)

- edit mode: `editorState: defaultValue` JSON으로 Lexical 초기화. `fill()`이 DOM만 업데이트하고 Lexical 내부 node tree는 stale → `$getSelection()`이 틀린 node에서 동작
- create mode: `fill()` + `Ctrl+A` + `.click()` 정상 동작

**해결**: `gotoForFormatTest()` 헬퍼로 기존 리뷰 삭제 → create mode 확보 후 포맷 테스트

```typescript
async function gotoForFormatTest(page) {
    // waitForResponse 먼저 등록 (race condition 방지)
    const reviewsFetchDone = page.waitForResponse(
        (resp) => resp.url().includes("/api/games/115/reviews"), { timeout: 25_000 }
    ).catch(() => null);
    await page.goto(GAME_URL);
    await reviewsFetchDone;
    // .glow-border 존재 여부 확인 (isVisible() 대신 waitFor 사용 — race condition 방지)
    let hasExistingReview = false;
    try {
        await page.locator(".glow-border").waitFor({ state: "visible", timeout: 8_000 });
        hasExistingReview = true;
    } catch { hasExistingReview = false; }
    if (hasExistingReview) {
        page.once("dialog", (dialog) => dialog.accept());
        await page.locator(".glow-border button.rounded-lg.p-2").first().click();
        const deleteResponse = page.waitForResponse(
            (resp) => resp.url().includes("/api/member/games/115/reviews/") &&
                resp.request().method() === "DELETE" && resp.status() === 200,
            { timeout: 20_000 }
        );
        await page.getByRole("button", { name: "삭제" }).click();
        await deleteResponse;
    }
    await expect(page.getByRole("button", { name: "굵게" })).toBeVisible({ timeout: 15_000 });
}
```

**MarkdownShortcutPlugin 추가** (`Comment.tsx`):
```typescript
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { HEADING } from "@lexical/markdown";
// LexicalComposer 내부:
<MarkdownShortcutPlugin transformers={[HEADING]} />
```

**race condition fix** (`gotoAndWaitForEditor`):
- 기존: `isVisible()` (즉시 반환) → 수정: `waitFor({ state: "visible", timeout: 8_000 })` (최대 8초 대기)

### 세션 8 수정 내역

#### `Comment.tsx` — 두 가지 버그 수정

**수정 1: B1 fix (별점 toast 누락)**
- 기존: `const editor = editorRef.current; if (!editor) return;` → `if (rating <= 0) { toast... }`
- 문제: edit mode에서 editorRef가 null이면 toast 표시 전에 조기 return
- 수정: rating check를 editorRef null guard **앞으로** 이동

**수정 2: EditorRefPlugin 추가 (editorRef null 문제)**
- 기존: OnChangePlugin의 `handleEditorChange`만으로 editorRef 설정 → 사용자 타이핑 전까지 null
- 문제: edit mode에서 defaultValue로 초기화 시 OnChangePlugin이 초기 상태 무시 → ref null
- 수정: `useLexicalComposerContext`를 사용해 마운트 시 즉시 editorRef 설정하는 `EditorRefPlugin` 추가
- 위치: LexicalComposer 내부 마지막 플러그인으로 추가

```tsx
function EditorRefPlugin({ editorRef }: { editorRef: MutableRefObject<LexicalEditor | null> }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => { editorRef.current = editor; }, [editor, editorRef]);
    return null;
}
```

#### `ToolbarPlugin.tsx` — onMouseDown prevention 추가

```tsx
const noFocus = (e: React.MouseEvent) => e.preventDefault();
// 모든 toolbar 버튼에 onMouseDown={noFocus} 추가
```

**의도**: toolbar 버튼 클릭 시 에디터 포커스 이탈 방지 (production 버그 수정)
**실제 효과**: Playwright 테스트에서는 여전히 focus loss 발생 (아래 "H1/Bold 미통과 원인" 참고)

---

### H1/Bold 미통과 원인 분석 (세션 8, 4회 시도 모두 실패)

**근본 원인**: Playwright의 click 동작이 Lexical 에디터의 selection을 항상 소멸시킴

**시도 1**: `click({ force: true })` + `waitForTimeout(500)` after Ctrl+A
- 결과: ❌ 여전히 selection 소멸

**시도 2**: `onMouseDown={(e) => e.preventDefault()}` 추가 후 `click({ force: true })`
- 결과: ❌ Playwright가 mousedown event handler보다 먼저 focus()를 명시 호출하는 것으로 추정

**시도 3**: Ctrl+A → Delete로 에디터 초기화 후 빈 단락에 H1 클릭
- 결과: ❌ Delete 키가 Lexical 에디터에서 선택된 내용을 제거하지 않거나 H1이 여전히 미적용

**시도 4**: `dispatchEvent("click")` — mousedown 없이 click만 발생시키는 방식
- 결과: ❌ 동일하게 실패. PATCH가 성공(200)하지만 콘텐츠가 변경되지 않음

**관찰**: 모든 시도에서 PATCH 응답은 200 (성공)하지만 snapshot의 content가 이전 reviewText 그대로.
이는 H1/bold 적용이 안 된 상태로 editor state가 원본을 그대로 저장하는 것을 의미.

**미해결 가설**:
1. `dispatchEvent("click")`이 React의 synthetic event로 올바르게 처리되지 않아 onClick이 발동 안 될 수 있음
2. onClick은 발동되나 Lexical `editor.update()` 내부에서 `$getSelection()`이 실제로 null을 반환
3. ToolbarPlugin이 `editor.update()` 내부에서 사용하는 selection이 Playwright 환경에서 다른 방식으로 동작

**다음 단계 (H1/bold 디버깅)**:
- Playwright MCP로 live 세션에서 `dispatchEvent("click")` 후 editor DOM 상태 확인
- 또는: `page.evaluate()`로 Lexical editor state를 직접 조작 (programmatic H1 적용)
- 또는: MarkdownShortcutPlugin 추가 후 `# H1 text` 방식으로 heading 생성 (툴바 버튼 우회)
- 또는: `await page.evaluate(() => { /* lexical editor.update() ... */ })` 를 통한 직접 API 접근

### 남은 작업

1. **H1/bold E2E 통과**: 위 "다음 단계" 중 하나 선택 후 적용
2. **E2E 테스트 전체 통과 후**: commit + PR `fix/#266` → `dev`

> DB 마이그레이션 (1-I, 1-J) — 불필요로 판단, 스킵
> 브라우저 수동 검증 (1-M) — 2026-03-20 완료

---

## 설치된 패키지 (실제)

```bash
# 추가됨
lexical @lexical/react @lexical/rich-text @lexical/list @lexical/link
@lexical/code @lexical/history @lexical/utils @lexical/html @lexical/headless
zod                          # usecase Zod 검증용 (기존에 없었음, 새로 설치)
jsdom @types/jsdom           # devDependency — 마이그레이션 스크립트용

# 제거됨
@tiptap/core @tiptap/starter-kit @tiptap/extension-image
@tiptap/extension-placeholder @tiptap/react
```

---

## 생성/수정/삭제된 파일

### 신규 생성

| 파일                                                                     | 역할                                      |
| ------------------------------------------------------------------------ | ----------------------------------------- |
| `app/(base)/games/[gameId]/components/lexical/nodes/ImageNode.tsx`       | Lexical DecoratorNode, base64 이미지 저장 |
| `app/(base)/games/[gameId]/components/lexical/nodes/index.ts`            | 공유 노드 목록 (에디터+렌더러 동일 사용)  |
| `app/(base)/games/[gameId]/components/lexical/plugins/ToolbarPlugin.tsx` | 전체 서식 툴바 (Phase 1+2 통합)           |
| `app/(base)/games/[gameId]/components/lexical/plugins/ImagePlugin.tsx`   | 이미지 업로드 플러그인                    |
| `app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx`        | read-only 렌더러 (editable=false)         |
| `scripts/migrateReviewsToLexical.ts`                                     | HTML → Lexical JSON DB 마이그레이션       |

### 수정됨

| 파일                                                                       | 변경 내용                                                    |
| -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `app/(base)/games/[gameId]/components/Comment.tsx`                         | TipTap `useEditor` → `LexicalComposer` + plugins 완전 재작성 |
| `app/(base)/games/[gameId]/components/CommentCard.tsx`                     | `dangerouslySetInnerHTML` → `<ReadOnlyReview />`             |
| `app/(base)/profile/components/MemberReviewItem.tsx`                       | 동일 + `processedContent` useMemo 제거                       |
| `backend/review/application/usecase/CreateReviewUsecase.ts`                | Zod 검증 + `extractTextContent` 10,000자 제한                |
| `backend/review/application/usecase/UpdateReviewUsecase.ts`                | 동일                                                         |
| `backend/review/application/usecase/__tests__/CreateReviewUsecase.test.ts` | 테스트 7개 (XSS, 빈값, 500KB, 10K자, invalid JSON 포함)      |
| `backend/review/application/usecase/__tests__/UpdateReviewUsecase.test.ts` | 동일 (6개)                                                   |
| `next.config.ts`                                                           | `async headers()` 추가 — CSP Report-Only                     |

### 삭제됨

- `app/(base)/games/[gameId]/components/CommentEditorToolbar.tsx` (ToolbarPlugin으로 통합)
- `app/(base)/games/[gameId]/components/extensions/CustomImage.ts`
- `app/(base)/games/[gameId]/components/extensions/FontSize.ts`

---

## 핵심 구현 결정사항

### 1. Zod v4 API 변경

- `z.record(z.unknown())` → Zod v4에서 **두 인자 필수**: `z.record(z.string(), z.unknown())`
- 단일 인자 버전은 `_zod` 내부 에러 발생 (v3 하위호환 없음)

### 2. Review.content DB 컬럼

- `String` = PostgreSQL `TEXT` (무제한) — **변경 불필요**
- `@db.VarChar(10000)` 절대 불가: base64 이미지 포함 시 즉시 초과
- 10,000자 제한은 **앱 레이어**에서: UI (charCount 표시) + usecase (`extractTextContent`)

### 3. extractTextContent 전략

- Lexical JSON 트리를 재귀 탐색 → `type: "text"` 노드의 `text` 필드만 수집
- base64 이미지 데이터는 카운트 제외 (src는 text 노드가 아님)
- usecase 두 곳에 동일 함수 중복 (공유 모듈 추출은 오버엔지니어링으로 판단)

### 4. ToolbarPlugin 링크 삽입

- 인라인 input 폼 방식 구현 (prompt() 대신)
- `/^https?:\/\//` 검증 → `TOGGLE_LINK_COMMAND` dispatch
- **링크 제거 기능 미구현**: 기존 링크 클릭 시 `TOGGLE_LINK_COMMAND, null` 미처리 (2-B 잔여)

### 5. Comment.tsx editorRef 패턴 (세션 8 업데이트)

```typescript
// editorRef로 submit 시 editor 인스턴스 접근
const editorRef = useRef<LexicalEditor | null>(null);

// 1차: EditorRefPlugin으로 마운트 시 즉시 설정 (세션 8 추가)
//   → edit mode defaultValue 초기화 시 OnChangePlugin이 미발동하는 문제 해결
function EditorRefPlugin({ editorRef }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => { editorRef.current = editor; }, [editor, editorRef]);
    return null;
}

// 2차: OnChangePlugin에서도 계속 업데이트 (charCount 겸용)
const handleEditorChange = (editorState, editor) => {
    editorRef.current = editor;  // 동일 인스턴스지만 유지
    // ...charCount 업데이트
};

// submit 시
// ① rating check (editorRef null 이전에 먼저 체크 — 세션 8 수정)
if (rating <= 0) { toast... return; }
// ② editorRef null guard
const editor = editorRef.current;
if (!editor) return;
const contentJson = JSON.stringify(editor.getEditorState().toJSON());
```

### 6. 테스트 현황

- 전체: **142개 통과** (기존 99개 + 43개 신규)
- Phase 1+2 신규: CreateReviewUsecase 7개, UpdateReviewUsecase 6개 (10K자 포함)
- Phase 3 신규: route POST +2, route PATCH/DELETE +8, ToolbarPlugin regex +6

### 7. Phase 3 — 자동화 테스트 코드 변경

**route 수정 (테스트 가능하도록)**

- `reviews/route.ts` — POST try-catch 추가 (usecase throw → 500 아닌 400)
- `reviews/[reviewId]/route.ts` — 모듈 스코프 인스턴스를 핸들러 내부로 이동 + PATCH try-catch 추가

**자동화 가능/불가 분류**

| 항목 | 자동화 |
|------|--------|
| non-JSON content → 400 | ✅ route 단위 테스트 |
| 10K자 초과 → 400 | ✅ route 단위 테스트 |
| PATCH 401/403/404/400/200 | ✅ route 단위 테스트 |
| DELETE 401/404/200 | ✅ route 단위 테스트 |
| `javascript:` 링크 거부 | ✅ regex 단위 테스트 |
| 에디터 작성 → 저장 → 렌더링 | ❌ 실제 브라우저 필요 |
| H1-H3/리스트/링크 렌더링 | ❌ 실제 브라우저 필요 |
| 10K자 경고색 UI | ❌ 시각적 검증 |
| 모바일 toolbar overflow | ❌ 뷰포트 레이아웃 |

---

## DB 마이그레이션 전 필수 확인

```sql
-- 1. 기존 리뷰 최대 글자 수 확인 (10,000자 초과 시 CharacterCount limit 재검토)
SELECT MAX(LENGTH(content)) FROM "Review";

-- 2. 전체 리뷰 건수
SELECT COUNT(*) FROM "Review";
```

마이그레이션 실행:

```bash
# 스테이징 먼저
npx tsx scripts/migrateReviewsToLexical.ts

# 프로덕션 (DB 백업 후)
npx tsx scripts/migrateReviewsToLexical.ts
```

> ⚠️ **중요**: Zod 검증이 서버에 있으므로 마이그레이션 전에 배포하면 기존 HTML 리뷰가 `400`으로 거부됨. **마이그레이션 완료 후 배포** 순서 준수.

---

## 의존성 및 제약사항

- **base64 이미지**: `readAsDataURL` 로직 유지. ImageNode의 `src` 필드에 data URI 저장.
- **DB 스키마**: `Review.content` 컬럼 타입 변경 불필요 (TEXT/String으로 동일).
- **배포 순서**: 마이그레이션 스크립트 실행 → 프론트+백 동시 배포 (전환 구간 최소화).
- **CSP**: `Report-Only` 모드로 먼저 적용 중 (framer-motion `unsafe-inline` 호환성).

---

## 관련 MASTER_PLAN 섹션

- `§2.3 XSS vulnerability` — 이 태스크의 핵심 취약점
- `§3.4 XSS Protection` — §2.3의 상세 구현 (Lexical 마이그레이션으로 접근 변경됨)
- `§7.2 Security Headers & Cookie Configuration` — CSP 헤더 관련 (부분 중복)

---

## E2E 인증 테스트 개발 기록 (세션 7 — 2026-03-21)

### 파일 구조

```
e2e/
  auth.setup.ts              # NextAuth 로그인 → e2e/.auth/user.json 저장
  game-detail-auth.spec.ts   # 5-H 인증 테스트 (6개)
```

`playwright.config.ts`에 `authenticated` project 추가 — `storageState: "e2e/.auth/user.json"`, `dependencies: ["setup"]`

### 테스트 헬퍼

```typescript
// reviews API 응답 대기 후 에디터 진입 (create/edit 모드 모두 처리)
async function gotoAndWaitForEditor(page)
    → waitForResponse("/api/games/115/reviews") 먼저 기다림
    → .glow-border 존재 시 MoreVertical 클릭 → "수정" 클릭 (edit mode)
    → "굵게" 버튼 visible 확인으로 에디터 준비 상태 보장

// reviews API 응답 대기 후 CommentCard visible 확인
async function gotoAndWaitForCommentCard(page)
    → 수정/삭제 테스트용

// 위치 기반 별점 클릭 (alt="full/empty" 관계없이 동작)
async function clickStar(page, index)
    → "div.flex-shrink-0 .h-[30px].w-[30px].cursor-pointer" nth(index)
```

### 주요 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| race condition: editor → CommentCard | async reviews fetch 후 CommentCard로 교체 | reviews fetch 완료 후 `.glow-border` 체크 |
| ToolbarPlugin DOM detachment | Lexical 재렌더링 중 버튼 DOM 분리 | `{ force: true }` + `waitForTimeout(500)` |
| 별점 클릭 실패 | 기존 리뷰 있을 때 star alt="full" (not "empty") | 위치 기반 selector로 교체 |
| B1 "등록" 버튼 없음 | 기존 리뷰 있으면 "수정" 모드라 "등록" 없음 | `gotoAndWaitForEditor` 사용 + `/등록\|수정/` 정규식 |
| B1 toast 미표시 (세션 8 해결) | `if (!editor) return` 이 rating check 앞에 위치 → edit mode에서 editorRef null 시 조기 return | `Comment.tsx`: rating check를 editorRef null guard 앞으로 이동 |
| 리뷰 제출 후 텍스트 미표시 (세션 8 해결) | Lexical OnChangePlugin이 defaultValue 로드 시 미발동 → editorRef null | `EditorRefPlugin` 추가 (useLexicalComposerContext로 마운트 시 editorRef 설정) |
| H1/bold 서식 미저장 (미해결) | Playwright 클릭 시 Lexical editor selection 소멸 → `$getSelection()` null → `$setBlocksType` 미동작 | 4가지 방법 시도 모두 실패. `dispatchEvent` 방식도 PATCH는 성공하나 콘텐츠 미변경. 진단 계속 필요. |

### Lexical OnChangePlugin 동작 메커니즘

`OnChangePlugin`의 `handleEditorChange`는 `prevEditorState.isEmpty()`인 경우(초기 마운트) 발동하지 않음.
→ edit mode에서 `defaultValue`(기존 JSON)으로 초기화 시 `editorRef.current`가 사용자 첫 상호작용 전까지 null.
→ `Ctrl+A` 후 타이핑해도 `editorRef`가 그때 set되기 때문에, 이후 submit은 동작함.
→ 그러나 test 2(리뷰 제출)에서는 별점 클릭 시 ref가 set되는데, 타이핑 전에 submit하면 null일 수 있음.

**진단용 확인**:
- `Comment.tsx`의 `OnChangePlugin` ignoreInitialChange 설정 확인
- edit mode에서 editorRef null 여부 로깅 추가

### 자격증명 노출 방지

```bash
# .env에 E2E_EMAIL, E2E_PASSWORD 설정 후
set -a; source .env; set +a; npx playwright test e2e/game-detail-auth.spec.ts --project=setup --project=authenticated
```

---

## 브라우저 조사 결과 (2026-03-20, 세션 4)

> Playwright MCP로 `/games/115` 에디터 상세 조사. 스크린샷: `snapshots/editor-09` ~ `editor-14`.
> 체크리스트 요약은 `xss-editor-tasks.md` — "브라우저 수동 검증 결과" 섹션 참고.

### 버그 발견 상세 (이 이슈 내 Phase 4에서 수정)

**[B1] 별점 0 상태로 등록 클릭 시 무반응** — Medium
- 파일: `Comment.tsx:116`
- 코드: `if (!editor || rating <= 0) return;` — toast 없이 조용히 return
- 재현: 인증된 사용자가 텍스트만 작성하고 별점 미선택 후 등록 클릭 → 아무 피드백 없음
- 참고: 미인증 경로(`!viewerId`)는 정상 작동 (toast → redirect). 인증된 상태에서만 silent fail.
- 수정 방향: `rating <= 0` 시 toast "별점을 선택해주세요" 표시

---

**[B2] 글자 크기 드롭다운이 커서 위치에서 새 텍스트에 미적용** — Medium
- 파일: `ToolbarPlugin.tsx:84-94`
- 원인: `$patchStyleText(selection, { "font-size": "Npx" })` — 선택된(highlighted) 텍스트에만 적용. collapsed cursor 상태에서는 no-op.
- 부작용: 드롭다운에 "24px"가 표시되지만 실제 텍스트는 16px. 이후 커서 이동 시 update listener가 현재 selection의 font-size("16px")를 읽어 드롭다운 값도 "16"으로 복원됨.
- 재현: 에디터 클릭(커서만) → 드롭다운 24px 선택 → 타이핑 → 텍스트 크기 그대로 16px
- 수정 방향: collapsed selection에서 크기 변경 시 `editor`의 pending style 메커니즘 활용 (또는 selection이 collapsed이면 paragraph 전체에 `$patchStyleText` 적용)

---

**[B3] 에디터 초기화 버튼 확인 다이얼로그 없음** — Low
- 파일: `ToolbarPlugin.tsx:295-299`
- 코드: `editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)` — 즉시 실행
- 재현: 긴 리뷰 작성 중 실수로 🗑️ 클릭 → 전체 내용 즉시 삭제
- 수정 방향: `window.confirm("에디터 내용을 모두 삭제하시겠습니까?")` 추가

---

**[B4] 초기화 후 글자 크기 드롭다운 미리셋** — Low
- 파일: `ToolbarPlugin.tsx:53-74`
- 원인: `CLEAR_EDITOR_COMMAND` 후 editor가 비어 있어 range selection 없음 → `registerUpdateListener`에서 `$isRangeSelection` 실패 → 조기 return → `setFontSize()` 미호출 → 이전 값 유지
- 재현: 24px 선택 → 초기화 클릭 → 드롭다운에 "24px" 유지됨
- 수정 방향: 초기화 버튼 클릭 핸들러에서 `setFontSize("16")` 직접 호출

---

**[B5] ReadOnlyReview에 Lexical theme 없음** — Medium
- 파일: `ReadOnlyReview.tsx:14-20`
- 원인: `initialConfig`에 `theme` 미설정. Lexical은 theme 클래스를 JS로 DOM에 주입하므로, theme 없이는 heading/quote/link에 어떤 CSS 클래스도 추가되지 않음.
- 현재 상태: `ContentEditable`에 `prose prose-sm` 적용 → `<strong>`, `<em>`, `<h1>` 등 기본 HTML 태그는 Tailwind prose가 처리 → **굵게는 정상 렌더링됨** (확인).
- 불일치 항목: heading 크기(`text-2xl font-bold`), blockquote 스타일(`border-l-4 border-line-200`), link 색상(`text-primary-purple-200 underline`) — 쓰기 뷰와 다름.
- 수정 방향: `Comment.tsx`의 `theme` 객체를 `sharedTheme.ts`로 분리해 두 곳에서 import

---

**[B6] 링크 팝업 취소 버튼 없음** — Low
- 파일: `ToolbarPlugin.tsx:266-291`
- 현재: Escape 키(`onKeyDown`)로만 닫을 수 있음. 버튼 UI에는 "확인"만 표시.
- 수정 방향: "취소" 버튼 추가 (`setIsLinkInputVisible(false); setLinkUrl("")`)

---

**[B7] 빈 단락이 150px clip을 낭비해 불필요한 더보기 트리거** — Low
- 파일: `CommentCard.tsx:73`
- 원인: Lexical JSON에 저장된 빈 paragraph 노드가 DOM에서 line-height 높이를 차지 → 실질 텍스트가 짧아도 `scrollHeight > 150` 조건 충족 → 더보기 버튼 표시
- 확인: `친절한이웃스파이` 리뷰 — 빈 단락 여러 개, 150px 클립에서 대부분 공백만 보임
- 수정 방향: 더보기 임계값 상향 조정 또는 빈 단락을 JSON 저장 시 trim

---

**[B8] AbortError 미처리로 false-positive 콘솔 에러** — Low
- 파일: `app/(base)/games/page.tsx:111-116`
- 원인: Chromium에서 `AbortController.abort()` 후 fetch가 `TypeError: Failed to fetch`를 throw함 (`error.name`이 `"AbortError"`가 아님). 현재 코드는 `error.name === "AbortError"`만 체크.
- 재현: `/games` → `/games/115` 빠른 내비게이션 → 콘솔에 `게임 데이터 요청 실패: TypeError: Failed to fetch`
- 수정 방향:
  ```ts
  if (error instanceof Error && (error.name === "AbortError" || controller.signal.aborted)) {
      console.log("요청 취소됨");
  } else {
      console.error("게임 데이터 요청 실패:", error);
  }
  ```
