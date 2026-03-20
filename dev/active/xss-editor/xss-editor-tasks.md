# XSS 에디터 개선 — 태스크 체크리스트

> Last Updated: 2026-03-21 (세션 6 — 추가 검토 반영)
> Issue: `fix/#266`
> **Approach**: TipTap → Lexical 마이그레이션
> **Status**: Phase 1 + Phase 2 + Phase 3 코드 완료. Phase 4 (브라우저 검증 버그 수정) 진행 중.

---

## Phase 1: Lexical 마이그레이션 (XSS 수정 포함)

### 1-A. Lexical 패키지 설치ㅡ

- [x] Lexical 코어 패키지 설치 (`lexical @lexical/react @lexical/rich-text @lexical/list @lexical/link @lexical/code @lexical/history @lexical/utils @lexical/html @lexical/headless`)
- [x] DB 마이그레이션 스크립트용 devDependency 설치 (`jsdom @types/jsdom`)
- [x] `zod` 설치 (usecase 검증용 — 기존에 없었음)

---

### 1-B. Lexical 커스텀 ImageNode 구현

- [x] `app/(base)/games/[gameId]/components/lexical/nodes/ImageNode.tsx` 생성
- [x] `app/(base)/games/[gameId]/components/lexical/nodes/index.ts` 생성

---

### 1-C. Comment.tsx 에디터 재작성

- [x] `LexicalComposer` 기반으로 전환
- [x] 플러그인 구성 (RichText, History, List, Link, OnChange, ClearEditor)
- [x] `ImagePlugin.tsx` 생성
- [x] submit 핸들러: `editorRef.current.getEditorState().toJSON()` → JSON.stringify → API
- [x] TipTap 코드 전면 제거

---

### 1-D. ToolbarPlugin.tsx 기본 구현

- [x] `app/(base)/games/[gameId]/components/lexical/plugins/ToolbarPlugin.tsx` 생성
- [x] `CommentEditorToolbar.tsx` 삭제 (ToolbarPlugin으로 통합)

---

### 1-E. ReadOnlyReview.tsx 구현

- [x] `app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx` 생성

---

### 1-F. CommentCard.tsx 수정

- [x] `dangerouslySetInnerHTML` 제거 → `<ReadOnlyReview content={comment} />` 교체

---

### 1-G. MemberReviewItem.tsx 수정

- [x] `dangerouslySetInnerHTML` 제거
- [x] `processedContent` useMemo (DOMParser) 제거
- [x] `<ReadOnlyReview content={review.content} />` 교체

---

### 1-H. Usecase Zod JSON 검증 추가

- [x] `CreateReviewUsecase.ts`: `validateReviewContent()` — 500KB 체크, JSON 파싱, Zod 스키마, 10,000자 텍스트 제한
- [x] `UpdateReviewUsecase.ts` 동일
- [x] `CreateReviewUsecase.test.ts` — 7개 테스트 (XSS/빈값/500KB/10K자/invalid JSON)
- [x] `UpdateReviewUsecase.test.ts` — 6개 테스트 동일 패턴

**Note (Zod v4 gotcha)**: `z.record()` 반드시 두 인자 — `z.record(z.string(), z.unknown())`. 단일 인자는 `_zod` 내부 에러 발생.

---

### 1-J. DB 마이그레이션 스크립트 작성 및 검증

- [x] `scripts/migrateReviewsToLexical.ts` 작성 (이미 JSON이면 skip, HTML → JSDOM → Lexical JSON 변환)
- [x] `npx tsx scripts/migrateReviewsToLexical.ts` 실행 — 8건 변환 완료 (실패 0건)

---

### 1-K. CSP 헤더 추가

- [x] `next.config.ts`에 `async headers()` 추가 (`Content-Security-Policy-Report-Only` + `connect-src ws: wss:`)

---

### 1-L. TipTap 패키지 및 파일 제거

- [x] `@tiptap/*` 패키지 전부 uninstall
- [x] `extensions/CustomImage.ts`, `extensions/FontSize.ts` 삭제
- [x] `CommentEditorToolbar.tsx` 삭제
- [x] `next build` 성공 확인

---

### 1-M. Phase 1 통합 검증 ⚠️ 수동 필요

- [x] 브라우저에서 Lexical 에디터 동작 확인 *(2026-03-20 브라우저 조사 — 아래 "조사 결과" 섹션 참고)*
- [x] curl로 API에 JSON 아닌 문자열 전송 → `400` 반환 확인 *(자동화: route 단위 테스트)*
- [x] `next build` 성공
- [x] 테스트 142개 통과

---

## Phase 2: 에디터 기능 개선 (Lexical 플러그인)

> **Phase 1과 동시 구현됨** — ToolbarPlugin에 모두 포함.

### 2-A. ToolbarPlugin 확장 (텍스트 서식)

- [x] Undo/Redo (`UNDO_COMMAND`, `REDO_COMMAND`)
- [x] Underline, Strikethrough (`FORMAT_TEXT_COMMAND`)
- [x] H1/H2/H3 (`$setBlocksType` → HeadingNode)
- [x] BulletList, OrderedList
- [x] Blockquote (`$setBlocksType` → QuoteNode)
- [x] active 상태 반영 (Bold/Italic/Underline/Strikethrough)

---

### 2-B. 링크 삽입 UI

- [x] 링크 버튼 클릭 시 인라인 URL input 폼 표시
- [x] `https://` 프로토콜 검증
- [x] `TOGGLE_LINK_COMMAND` dispatch
- [ ] **기존 링크 편집/제거** 미구현 (`TOGGLE_LINK_COMMAND, null`) — 추후 개선

---

### 2-G. 링크 버튼 → AutoLinkPlugin 자동 변환으로 교체

> 링크 버튼+팝업 대신 타이핑/붙여넣기 시 URL을 자동 링크로 변환하는 방식 검토.
> `@lexical/react/LexicalAutoLinkPlugin` 사용. 기존 `https?://` 검증은 AutoLinkPlugin matcher로 동일하게 적용 가능.

- [ ] `AutoLinkPlugin` import 및 URL/이메일 matcher 설정
- [ ] `ToolbarPlugin`에서 링크 버튼 및 팝업 UI 제거 (B6 취소 버튼 이슈도 함께 해소)
- [ ] `LinkPlugin`은 그대로 유지 (링크 클릭 동작 담당)
- [ ] 브라우저에서 URL 붙여넣기 → 자동 링크 변환 확인

---

### 2-C. Font Size Select 드롭다운

- [x] `<select>` 드롭다운 (12/14/16/18/20/24/32px)
- [x] `$patchStyleText(selection, { "font-size": "Npx" })`
- [x] `$getSelectionStyleValueForProperty`로 현재 값 반영

---

### 2-D. 글자 수 표시 + 10,000자 제한

- [x] `OnChangePlugin`으로 charCount 추적 (UI 표시)
- [x] 경고색: 9000자+ 노란색, 10000자+ 빨간색
- [x] **usecase에서도 10,000자 제한** (`extractTextContent` 재귀 탐색 — base64 이미지 제외)

---

### 2-E. 접근성 및 모바일

- [x] 모든 툴바 버튼 `aria-label` 추가
- [x] `overflow-x-auto whitespace-nowrap` 적용

---

### 2-F. Phase 2 통합 검증 ⚠️ 수동 필요

- [x] 모든 툴바 버튼 브라우저 동작 확인 *(2026-03-20 — 아래 조사 결과 참고)*
- [ ] H1-H3, 리스트, 링크 저장 후 ReadOnlyReview 렌더링 *(인증 필요 — 미확인)*
- [x] 10,000자 제한 경고색 동작 확인
- [x] 링크 `javascript:` 거부 확인 *(자동화: ToolbarPlugin regex 단위 테스트)*
- [ ] 모바일 툴바 overflow 확인
- [x] `next build` 성공

---

## Phase 3: 자동화 테스트

### 3-A. Route 핸들러 try-catch 수정

- [x] `reviews/route.ts` POST — try-catch 추가 (usecase throw → 400)
- [x] `reviews/[reviewId]/route.ts` PATCH — try-catch 추가
- [x] `reviews/[reviewId]/route.ts` — 모듈 스코프 인스턴스 → 핸들러 내부 이동 (vi.mock 동작)

---

### 3-B. Route 단위 테스트

- [x] `reviews/__tests__/route.test.ts` 확장 — non-JSON → 400, 10K자 → 400 (+2)
- [x] `reviews/[reviewId]/__tests__/route.test.ts` 신규 — PATCH 5개, DELETE 3개 (+8)

---

### 3-C. ToolbarPlugin 링크 검증 단위 테스트

- [x] `lexical/plugins/__tests__/ToolbarPlugin.test.ts` 신규 — regex 6개 (`javascript:` 거부 포함)

---

### 3-D. 자동화 불가 항목 (수동 유지)

- Lexical 에디터 실제 작성 → 저장 → 렌더링 (실제 브라우저 필요)
- H1-H3, 리스트, 링크 서식 저장 후 렌더링
- 10,000자 경고색 UI
- 모바일 툴바 overflow (뷰포트 레이아웃)

---

## 브라우저 수동 검증 결과 (2026-03-20, 세션 4)

> Playwright MCP로 `/games/115` 에디터 상세 조사. 스크린샷: `snapshots/editor-09` ~ `editor-14`.
> 버그 상세 내용은 `xss-editor-context.md` — "브라우저 조사 결과 / 버그 발견" 섹션 참고.

### ✅ 정상 동작 확인

| 기능 | 결과 |
|------|------|
| 굵게/기울임/밑줄/취소선 | 버튼 하이라이트 + 텍스트 적용 정상 |
| H1/H2/H3 | 블록 변환 동작 |
| 글머리 기호 목록 | 불릿 표시 정상 |
| 인용구 | 좌측 테두리 표시 정상 |
| 글자 수 카운터 | 실시간 업데이트, 9000/10000 경고색 정상 |
| 별점 입력 | 0.5 단위 선택 정상 |
| 미인증 등록 시도 | 토스트 1초 후 `/log-in?callbackUrl=...` 리다이렉트 정상 |
| Undo/Redo | 동작 |
| ReadOnlyReview 굵은 텍스트 | `<strong>` → prose 스타일 정상 렌더링 |

### ❌ 발견된 버그 → Phase 4에서 수정 (이 이슈 내 처리)

| ID | 파일 | 우선순위 | 요약 |
|----|------|----------|------|
| B1 | `Comment.tsx:116` | Medium | 별점 0 상태로 등록 시 무반응 (toast 없음) |
| B2 | `ToolbarPlugin.tsx:84-94` | Medium | 글자 크기 드롭다운이 커서 위치에서 새 텍스트에 미적용 |
| B3 | `ToolbarPlugin.tsx:295-299` | Low | 에디터 초기화 버튼 확인 다이얼로그 없음 |
| B4 | `ToolbarPlugin.tsx:53-74` | Low | 초기화 후 글자 크기 드롭다운 미리셋 안 됨 |
| B5 | `ReadOnlyReview.tsx:14-20` | Medium | ReadOnlyReview에 Lexical theme 없음 (heading/quote/link 스타일 불일치) |
| B6 | `ToolbarPlugin.tsx:266-291` | Low | 링크 팝업 취소 버튼 없음 |
| B7 | `CommentCard.tsx:73` | Low | 빈 단락이 150px clip을 낭비 → 불필요한 더보기 트리거 |
| B8 | `app/(base)/games/page.tsx:111-116` | Low | AbortError 미처리 → false-positive 콘솔 에러 |

---

## Phase 4: 브라우저 검증 버그 수정

### 4-A. [B1] 별점 미선택 시 toast 피드백 추가 — Medium

- [ ] `Comment.tsx:116`: `rating <= 0` 분기에서 toast "별점을 선택해주세요" 표시 후 return

---

### 4-B. [B5] ReadOnlyReview Lexical theme 추가 — Medium

- [x] `Comment.tsx`의 `theme` 객체를 `lexical/sharedTheme.ts`로 분리
- [x] `ReadOnlyReview.tsx`에서 동일 theme import + `initialConfig`에 적용
- [ ] heading/blockquote/link CSS 클래스 에디터 뷰와 일치 확인 (인증 후 직접 작성 필요)

---

### 4-C. [B2] 글자 크기 커서 위치 적용 — Medium

- [ ] `ToolbarPlugin.tsx`: collapsed selection 시 현재 paragraph 전체에 `$patchStyleText` 적용 (또는 Lexical pending style 메커니즘 활용)

---

### 4-D. [B3] 에디터 초기화 확인 다이얼로그 — Low

- [ ] `ToolbarPlugin.tsx:295-299`: `CLEAR_EDITOR_COMMAND` 전 `window.confirm()` 추가

---

### 4-E. [B4] 초기화 후 글자 크기 드롭다운 리셋 — Low

- [ ] `ToolbarPlugin.tsx`: 초기화 핸들러에서 `setFontSize("16")` 직접 호출

---

### 4-F. [B6] 링크 팝업 취소 버튼 — Low

- [ ] `ToolbarPlugin.tsx:266-291`: "취소" 버튼 추가 (`setIsLinkInputVisible(false); setLinkUrl("")`)

---

### 4-G. [B7] 빈 단락 더보기 트리거 — Low

- [ ] `CommentCard.tsx:73`: 더보기 임계값 상향 조정 또는 빈 단락 trim 전략 결정 후 수정

---

### 4-H. [B8] AbortError 미처리 — Low

- [ ] `app/(base)/games/page.tsx:111-116`: `controller.signal.aborted` 체크 추가해 false-positive 콘솔 에러 제거

---

### 4-I. [추가] 플레이스홀더 위치 오류 수정 — Critical (완료)

- [x] `Comment.tsx:202`: `absolute left-8 top-[100px]` → `RichTextPlugin`을 `<div className="relative">` 로 감싸고 플레이스홀더를 `absolute left-4 top-4` 로 변경
- [x] Lexical flex container 경고("When using display: flex...") 해소

---

### 4-J. [추가] CommentCard 날짜 하드코딩 absolute 제거 — Medium (완료)

- [x] `CommentCard.tsx:176`: `absolute left-[69px] top-[46px]` → flex column 구조로 변경 (`pl-[52px]` 인덴트로 아바타 열 정렬)

---

## Phase 5: E2E 테스트 — 게임 상세 페이지 UI 검증

> 파일: `e2e/game-detail.spec.ts`
> 기준 URL: `/games/115` (테스트 데이터 존재 확인됨)
> 모든 테스트는 비인증 상태 기준. 인증 필요 항목은 별도 표시.

---

### 5-A. 페이지 기본 렌더링

- [ ] `/games/:id` 접속 시 500/404 없이 정상 로드
- [ ] `<h2>` 게임 제목 visible
- [ ] 개발사(developer) 텍스트 visible
- [ ] 평점 영역: `X.X / 5.0` 또는 `"평점 없음"` 텍스트 visible
- [ ] `"겜잘알 평점"` 라벨 visible
- [ ] `"출시일"` 라벨 visible

---

### 5-B. 게임 정보 카드 (GameInfoCard)

- [ ] `"게임 정보"` heading visible
- [ ] `"플랫폼"` 라벨 및 값 visible
- [ ] `"장르"` 라벨 및 값 visible
- [ ] `"테마"` 라벨 및 값 visible
- [ ] `"위시"` 라벨 및 숫자 값 visible
- [ ] `"리뷰"` 라벨 및 숫자 값 visible

---

### 5-C. 리뷰 셀렉터 (ReviewSelector)

- [ ] `"겜잘알 리뷰"` 버튼 visible
- [ ] `"일반 리뷰"` 버튼 visible
- [ ] 기본 선택: `"겜잘알 리뷰"` 버튼이 active 상태 (border-primary-purple-200 클래스 또는 aria 기반)
- [ ] `"일반 리뷰"` 클릭 시 해당 버튼이 active 상태로 전환
- [ ] 각 버튼 내 별점(`X.X / 5.0`) 및 리뷰 수 텍스트 visible

---

### 5-D. Lexical 에디터 (Comment — 비인증)

- [ ] 에디터 영역(`ContentEditable`) visible
- [ ] 플레이스홀더 `"리뷰를 입력하세요..."` visible (에디터 빈 상태)
- [ ] 툴바 Row1 버튼 확인: 실행취소, 다시실행, 굵게, 기울임, 밑줄, 취소선, H1, H2, H3, 목록, 번호목록, 인용구
- [ ] 툴바 Row2 확인: 글자크기 `<select>`, 사진 버튼, 링크 버튼, 초기화(Trash) 버튼
- [ ] 글자 수 카운터 `"0 / 10,000"` visible
- [ ] 별점 컴포넌트(StarRating) visible
- [ ] `"등록"` 버튼 visible
- [ ] 비인증 상태에서 `"등록"` 클릭 → `"로그인이 필요합니다"` toast 표시 후 `/log-in` 리다이렉트

---

### 5-E. 에디터 인터랙션 (비인증 — 로그인 불필요 항목)

- [ ] 에디터 클릭 후 타이핑 → 글자 수 카운터 실시간 증가
- [ ] 링크 버튼 클릭 → URL 인풋 팝업 표시 (`placeholder="https://"`)
- [ ] URL 인풋에 `"https://example.com"` 입력 후 Enter → 팝업 닫힘
- [ ] URL 인풋에서 Escape 키 → 팝업 닫힘
- [ ] 초기화(Trash) 버튼 클릭 → 에디터 내용 비워짐 (confirm 다이얼로그는 B3 수정 후 대응)

---

### 5-F. CommentCard 렌더링 (리뷰 데이터 있을 때)

> 리뷰가 1개 이상 존재하는 gameId 사용 필요

- [ ] CommentCard: 닉네임, 날짜, 별점(`X.X`) visible
- [ ] CommentCard: 좋아요 버튼 및 카운트 visible
- [ ] 텍스트 150px 초과 리뷰: `"더보기"` 버튼 visible
- [ ] `"더보기"` 클릭 → 콘텐츠 확장, `"접기"` 버튼으로 전환
- [ ] `"접기"` 클릭 → 콘텐츠 다시 접힘

---

### 5-G. 페이지네이션 (리뷰 5개 이상일 때)

> 리뷰 5개 이상인 gameId 사용 필요

- [ ] Pager 컴포넌트 visible
- [ ] 2페이지 클릭 → 다른 리뷰 세트 렌더링 (첫 페이지 리뷰 사라짐)
- [ ] 1페이지로 돌아오기 정상 동작

---

### 5-H. 인증 필요 항목 *(별도 auth fixture 설정 후)*

- [ ] 로그인 상태에서 별점 미선택 후 `"등록"` → `"별점을 선택해주세요"` toast (B1 수정 후)
- [ ] 에디터에 텍스트 입력 + 별점 선택 → `"등록"` → CommentCard로 렌더링 확인
- [ ] H1/H2/H3 서식 저장 후 ReadOnlyReview에 heading 스타일 반영 확인 (B5 수정 후)
- [ ] 굵게/기울임/밑줄 저장 후 ReadOnlyReview 스타일 반영 확인
- [ ] 내 댓글 수정 클릭 → Comment 에디터로 전환 + 기존 내용 로드
- [ ] 내 댓글 삭제 클릭 → confirm → CommentCard 사라짐

---

## 기타 — 인프라 정리

### T-1. Playwright 설정 BASE_URL 일관성 — Low

> `playwright.config.ts`에서 `baseURL`은 `process.env.BASE_URL ?? "http://localhost:3000"`으로 이미 환경변수화 되어 있으나,
> `webServer.url`(서버 헬스체크용)은 `"http://localhost:3000"`으로 하드코딩. 두 값이 다를 경우 CI/CD 환경에서 불일치 발생 가능.
> 보안 위험은 없으나 일관성 목적으로 수정 권장.

- [ ] `playwright.config.ts`: `const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000"` 상수로 추출
- [ ] `use.baseURL`과 `webServer.url` 모두 `BASE_URL` 변수 참조로 변경
