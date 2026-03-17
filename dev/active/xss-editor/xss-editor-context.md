# XSS 에디터 개선 — 컨텍스트

> Last Updated: 2026-03-17 (세션 2 — 구현 완료)
> Branch: `fix/#266`
> **Status**: Phase 1 + Phase 2 코드 구현 완료. DB 마이그레이션 및 수동 검증만 남음.

---

## 현재 구현 상태

### Phase 1: 완료 (코드)

모든 XSS 취약점이 구조적으로 제거됨. `next build` 성공. 테스트 126개 통과.

### Phase 2: 완료 (코드)

ToolbarPlugin에 모든 서식 버튼 포함. Phase 1과 동시 구현됨.

### 남은 작업 (수동)

1. **1-M**: 브라우저에서 에디터 동작 수동 검증
2. **PR**: `fix/#266` → `dev` PR 생성

> DB 마이그레이션 (1-I, 1-J) — 불필요로 판단, 스킵

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

- 전체: **126개 통과** (기존 99개 + 27개 신규)
- 신규: CreateReviewUsecase 7개, UpdateReviewUsecase 6개 (10K자 포함)

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
