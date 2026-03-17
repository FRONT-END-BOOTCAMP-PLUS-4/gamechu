# XSS 에디터 개선 — 태스크 체크리스트

> Last Updated: 2026-03-17
> Issue: `fix/#266`
> **Approach**: TipTap → Lexical 마이그레이션

---

## Phase 1: Lexical 마이그레이션 (XSS 수정 포함)

### 1-A. Lexical 패키지 설치

- [ ] Lexical 코어 패키지 설치
    ```bash
    npm install lexical @lexical/react @lexical/rich-text @lexical/list @lexical/link \
                @lexical/code @lexical/history @lexical/utils @lexical/html
    ```
- [ ] DB 마이그레이션 스크립트용 devDependency 설치
    ```bash
    npm install --save-dev jsdom @types/jsdom
    ```

**AC**: `package.json`에 Lexical 패키지 확인, `npm install` 오류 없음

---

### 1-B. Lexical 커스텀 ImageNode 구현

- [ ] `app/(base)/games/[gameId]/components/lexical/nodes/ImageNode.tsx` 생성
    - `DecoratorNode` 상속
    - 필드: `src: string`, `alt: string`, `width: number`
    - `static getType(): "image"`, `static clone()`, `static importJSON()`, `exportJSON()`
    - `decorate()`: `<img src alt width style="max-width:100%" />` 반환
- [ ] `app/(base)/games/[gameId]/components/lexical/nodes/index.ts` 생성
    - `HeadingNode`, `QuoteNode`, `ListNode`, `ListItemNode`, `LinkNode`, `AutoLinkNode`, `CodeNode`, `CodeHighlightNode`, `ImageNode` export
    - 에디터와 렌더러 양쪽에서 동일하게 import하는 공유 노드 목록

**AC**: `new ImageNode("data:...", "alt", 300)` 생성 및 `exportJSON()` 정상 직렬화

---

### 1-C. Comment.tsx 에디터 재작성

- [ ] `LexicalComposer` 기반으로 전환
    - `initialConfig`: namespace, nodes(index.ts 공유 목록), theme, onError
    - `editorState`: 수정 모드에서 기존 content JSON 로드
- [ ] 플러그인 구성:
    - `RichTextPlugin` + `ContentEditable` + `LexicalErrorBoundary`
    - `HistoryPlugin` (Undo/Redo)
    - `ListPlugin`
    - `LinkPlugin` (validateUrl 설정)
    - `OnChangePlugin` (에디터 상태 변경 시 상위로 전달)
- [ ] `ImagePlugin.tsx` 생성
    - 파일 input onChange → `readAsDataURL` → `editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src, alt, width: 300 })`
- [ ] submit 핸들러: `editor.getEditorState().toJSON()` → `JSON.stringify()` → API body
- [ ] TipTap `useEditor` import 및 관련 코드 제거

**AC**: Lexical 에디터 렌더링, 텍스트 입력, Bold/Italic, 이미지 삽입 정상 동작

---

### 1-D. ToolbarPlugin.tsx 기본 구현

- [ ] `app/(base)/games/[gameId]/components/lexical/plugins/ToolbarPlugin.tsx` 생성
    - `useLexicalComposerContext()`로 editor 인스턴스 접근
    - Bold, Italic 버튼 (`FORMAT_TEXT_COMMAND`)
    - 이미지 업로드 트리거 (ImagePlugin과 연계)
    - 에디터 초기화(Clear) 버튼
- [ ] `CommentEditorToolbar.tsx` → ToolbarPlugin 사용으로 교체 (또는 ToolbarPlugin으로 통합)

**AC**: Bold/Italic 토글, 에디터 초기화 정상 동작

---

### 1-E. ReadOnlyReview.tsx 구현

- [ ] `app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx` 생성
    ```tsx
    // "use client"
    // LexicalComposer initialConfig: editable=false, editorState=content(JSON string)
    // nodes: index.ts 공유 목록
    // RichTextPlugin + ContentEditable className="prose text-sm"
    ```

**AC**: Lexical JSON 문자열을 prop으로 받아 정상 렌더링

---

### 1-F. CommentCard.tsx 수정

- [ ] `CommentCard.tsx:239` `dangerouslySetInnerHTML={{ __html: comment }}` 제거
- [ ] `<ReadOnlyReview content={comment} />` 로 교체
- [ ] 기존 `DOMParser`, `processedContent` 관련 코드 제거 (있는 경우)

**AC**: `dangerouslySetInnerHTML` 코드 없음; 리뷰 콘텐츠 정상 렌더링

---

### 1-G. MemberReviewItem.tsx 수정

- [ ] `MemberReviewItem.tsx:119` `dangerouslySetInnerHTML={{ __html: processedContent }}` 제거
- [ ] `processedContent` useMemo (DOMParser img alt 처리 로직) 제거
- [ ] `<ReadOnlyReview content={review.content} />` 로 교체

**AC**: `dangerouslySetInnerHTML` 코드 없음; 프로필 리뷰 정상 렌더링

---

### 1-H. Usecase Zod JSON 검증 추가

- [ ] `backend/review/application/usecase/CreateReviewUsecase.ts` 수정
    - `validateReviewContent(dto.content)` 호출:
        - `Buffer.byteLength(content) > 500_000` → throw
        - `JSON.parse(content)` 실패 → throw
        - `LexicalEditorStateSchema.parse(parsed)` 실패 → throw
    - 검증 통과 후 `reviewRepository.create()` 호출
- [ ] `backend/review/application/usecase/UpdateReviewUsecase.ts` 동일하게 적용
- [ ] `backend/review/application/usecase/__tests__/CreateReviewUsecase.test.ts` 업데이트
    - 유효한 Lexical JSON → 정상 저장
    - `<script>alert(1)</script>` 직접 전송 → throw (JSON parse 실패)
    - 500KB 초과 → throw
    - 빈 문자열 → throw
- [ ] `backend/review/application/usecase/__tests__/UpdateReviewUsecase.test.ts` 동일

**AC**: XSS payload 직접 전송 시 `400` 응답; 유효한 Lexical JSON은 정상 저장

---

### 1-I. DB 마이그레이션 사전 확인

- [ ] 기존 리뷰 최대 글자 수 확인
    ```sql
    SELECT MAX(LENGTH(content)) FROM "Review";
    ```
    → 결과가 10,000자 초과 시 Phase 2 CharacterCount limit 상향 조정
- [ ] 전체 리뷰 건수 확인
    ```sql
    SELECT COUNT(*) FROM "Review";
    ```

**AC**: 수치 기록 후 Phase 2-D limit 결정

---

### 1-J. DB 마이그레이션 스크립트 작성 및 검증

- [ ] `scripts/migrateReviewsToLexical.ts` 작성
    - `createHeadlessEditor` + 공유 노드 목록 등록
    - 각 리뷰의 `content` 확인: 이미 JSON이면 건너뜀
    - HTML → JSDOM → `$generateNodesFromDOM` → Lexical JSON
    - `prisma.review.update()` 배치 처리
- [ ] 스테이징 DB에서 실행 및 검증
    - 샘플 리뷰 10건 이상 수동 확인 (base64 이미지 포함된 리뷰 집중 검증)
    - `ReadOnlyReview`에서 마이그레이션된 콘텐츠 정상 렌더링 확인
- [ ] 프로덕션 DB 마이그레이션 실행 (백업 후)

**AC**: 모든 리뷰 `content`가 `{ root: { children: [...] } }` JSON 형태; `ReadOnlyReview` 정상 렌더링

---

### 1-K. CSP 헤더 추가

- [ ] `next.config.ts`에 `async headers()` 추가
    ```
    Content-Security-Policy-Report-Only:
      default-src 'self';
      script-src 'self';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' ws: wss:;   ← Socket.IO (M-5 해결)
    ```

**AC**: 응답 헤더에 `Content-Security-Policy-Report-Only` 포함; 브라우저 콘솔 CSP 위반 report 확인

---

### 1-L. TipTap 패키지 및 파일 제거

- [ ] TipTap npm 패키지 제거
    ```bash
    npm uninstall @tiptap/core @tiptap/starter-kit @tiptap/extension-image \
                  @tiptap/extension-placeholder @tiptap/extension-react
    ```
- [ ] `app/(base)/games/[gameId]/components/extensions/CustomImage.ts` 삭제
- [ ] `app/(base)/games/[gameId]/components/extensions/FontSize.ts` 삭제
- [ ] `next build` 성공 확인 (TipTap import 잔재 없음)

**AC**: `package.json`에 `@tiptap/*` 없음; `next build` 성공

---

### 1-M. Phase 1 통합 검증

- [ ] Lexical 에디터로 리뷰 작성 → 저장 → `ReadOnlyReview`에서 정상 렌더링
- [ ] 기존 리뷰 (마이그레이션된 데이터) `CommentCard`, `MemberReviewItem`에서 정상 렌더링
- [ ] API에 JSON이 아닌 문자열 직접 전송 → `400` 반환 확인
- [ ] `next build` 성공

---

## Phase 2: 에디터 기능 개선 (Lexical 플러그인)

### 2-A. ToolbarPlugin 확장 (텍스트 서식)

**행 1 추가 버튼**:

- [ ] Undo 버튼 (`UNDO_COMMAND`)
- [ ] Redo 버튼 (`REDO_COMMAND`)
- [ ] Underline (`FORMAT_TEXT_COMMAND, "underline"`)
- [ ] Strike (`FORMAT_TEXT_COMMAND, "strikethrough"`)
- [ ] H1 (`editor.dispatchCommand(FORMAT_HEADING_COMMAND, "h1")` 또는 `$setBlocksType`)
- [ ] H2, H3 동일
- [ ] 불릿 리스트 (`INSERT_UNORDERED_LIST_COMMAND`)
- [ ] 번호 리스트 (`INSERT_ORDERED_LIST_COMMAND`)
- [ ] 인용구 (`$setBlocksType` → QuoteNode)

**AC**: 각 버튼 클릭 시 서식 적용, `isActive` 상태 반영 (active 버튼 강조)

---

### 2-B. 링크 삽입 UI

- [ ] 링크 버튼 클릭 시 URL input 인라인 폼 또는 prompt 표시
- [ ] 입력값 `https://` 프로토콜 검증
- [ ] `editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)` 실행
- [ ] 기존 링크 편집/제거 지원 (`TOGGLE_LINK_COMMAND, null`)

**AC**: 유효한 URL만 링크 생성; `javascript:` 프로토콜 거부

---

### 2-C. Font Size Select 드롭다운

- [ ] 기존 12px/24px 토글 버튼 → `<select>` 드롭다운 교체
    - 옵션: 12, 14, 16(기본), 18, 20, 24, 32px
- [ ] `$patchStyleText(selection, { "font-size": "${size}px" })` 적용
- [ ] 현재 커서 위치 font-size 반영: `$getSelectionStyleValueForProperty(selection, "font-size", "16px")`

**AC**: 드롭다운 선택 시 선택 영역 font-size 변경; 커서 이동 시 드롭다운 값 업데이트

---

### 2-D. 글자 수 표시

- [ ] `OnChangePlugin`으로 `$getRoot().getTextContent().length` 추적
- [ ] `EditorContent` 하단에 `{charCount} / 10,000` 표시
    - `charCount >= 10000`: 빨간색
    - `charCount >= 9000`: 노란색
    - 그 외: 회색
- [ ] CharacterCount limit 설정 (1-I에서 확인한 DB max 기준으로 결정)

**AC**: 글자 수 실시간 업데이트; 경고색 정상 표시

---

### 2-E. 접근성 및 모바일

- [ ] 모든 툴바 버튼에 `aria-label` 추가
- [ ] 툴바에 `overflow-x-auto` + `whitespace-nowrap` 적용 (모바일 스크롤)

**AC**: axe 또는 브라우저 접근성 검사 `aria-label` 경고 없음; 모바일 화면 툴바 스크롤 정상

---

### 2-F. Phase 2 통합 검증

- [ ] 모든 툴바 버튼 정상 작동 확인
- [ ] 리뷰 저장 후 `ReadOnlyReview`에서 새 서식 정상 렌더링 (H1-H3, 리스트, 링크 등)
- [ ] 10,000자 제한 경고색 표시 확인
- [ ] 링크 `javascript:` 프로토콜 거부 확인
- [ ] 모바일 툴바 레이아웃 확인
- [ ] `next build` 성공
