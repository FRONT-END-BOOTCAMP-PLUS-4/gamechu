# XSS 에디터 개선 — 컨텍스트

> Last Updated: 2026-03-21 (세션 6 — 추가 검토 반영)
> Branch: `fix/#266`
> **Status**: Phase 1 + Phase 2 + Phase 3 코드 완료. Phase 4 (브라우저 검증 버그 수정) 진행 중. PR은 Phase 4 완료 후.

---

## 현재 구현 상태

### Phase 1: 완료 (코드)

모든 XSS 취약점이 구조적으로 제거됨. `next build` 성공. 테스트 126개 통과.

### Phase 2: 완료 (코드)

ToolbarPlugin에 모든 서식 버튼 포함. Phase 1과 동시 구현됨.

### 남은 작업

1. **Phase 4 버그 수정** (B1-B8 — `xss-editor-tasks.md` Phase 4 참고)
   - Medium 우선: B1 (별점 toast), B5 (ReadOnlyReview theme), B2 (글자 크기 커서)
   - Low 우선: B3/B4/B6/B7/B8
2. H1-H3, 리스트, 링크 저장 후 ReadOnlyReview 렌더링 확인 (인증 필요 — 미완)
3. 모바일 툴바 overflow 확인
4. **PR**: `fix/#266` → `dev` PR 생성 (Phase 4 완료 후)
5. **E2E 테스트** — `e2e/game-detail.spec.ts` 신규 작성 (`xss-editor-tasks.md` Phase 5 참고)
   - 5-A~G: 비인증 UI 검증 (페이지 구조, 게임 정보 카드, 리뷰 셀렉터, 에디터, CommentCard, 페이지네이션)
   - 5-H: 인증 필요 항목 — auth fixture 설정 후 진행
6. **링크 UX 개선** — 링크 버튼+팝업 → `AutoLinkPlugin` 자동 URL 변환으로 교체 검토 (`xss-editor-tasks.md` 2-G 참고)
7. **이미지 이동/재배치** — Lexical DecoratorNode 드래그 앤 드롭 커스텀 구현 필요 (작업량 큼 → **보류**)

> DB 마이그레이션 (1-I, 1-J) — 불필요로 판단, 스킵
> 브라우저 수동 검증 (1-M) — 2026-03-20 완료 (아래 "브라우저 조사 결과" 참고)

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

### 5. Comment.tsx editorRef 패턴

```typescript
// editorRef로 submit 시 editor 인스턴스 접근
const editorRef = useRef<LexicalEditor | null>(null);
// OnChangePlugin에서 ref 업데이트
const handleEditorChange = (editorState, editor) => {
    editorRef.current = editor;
    // ...charCount 업데이트
};
// submit 시
const contentJson = JSON.stringify(editorRef.current.getEditorState().toJSON());
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
