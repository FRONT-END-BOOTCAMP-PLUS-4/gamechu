# XSS 에디터 개선 — 태스크 체크리스트

> Last Updated: 2026-03-17 (세션 2 — 코드 구현 완료)
> Issue: `fix/#266`
> **Approach**: TipTap → Lexical 마이그레이션
> **Status**: Phase 1 + Phase 2 코드 완료. DB 마이그레이션 및 수동 검증 + PR 남음.

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

- [ ] 브라우저에서 Lexical 에디터 리뷰 작성 → 저장 → `ReadOnlyReview` 렌더링
- [ ] curl로 API에 JSON 아닌 문자열 전송 → `400` 반환 확인
- [x] `next build` 성공
- [x] 테스트 126개 통과

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

- [ ] 모든 툴바 버튼 브라우저 동작 확인
- [ ] H1-H3, 리스트, 링크 저장 후 ReadOnlyReview 렌더링
- [ ] 10,000자 제한 경고색 동작 확인
- [ ] 링크 `javascript:` 거부 확인
- [ ] 모바일 툴바 overflow 확인
- [x] `next build` 성공
