# XSS 에디터 개선 — 컨텍스트

> Last Updated: 2026-03-17
> Branch: `fix/#266`
> **Decision**: TipTap → Lexical 마이그레이션 (plan review C-1/C-2/C-3 결과)

---

## Key Files

### XSS 취약 파일 (수정 대상)

| 파일                                                        | 역할               | 변경 내용                                                           |
| ----------------------------------------------------------- | ------------------ | ------------------------------------------------------------------- |
| `app/(base)/games/[gameId]/components/CommentCard.tsx:239`  | 리뷰 렌더링        | `dangerouslySetInnerHTML` 제거 → `<ReadOnlyReview />` 교체          |
| `app/(base)/profile/components/MemberReviewItem.tsx:119`    | 프로필 리뷰 렌더링 | `dangerouslySetInnerHTML` + DOMParser useMemo 제거 → `<ReadOnlyReview />` |
| `backend/review/application/usecase/CreateReviewUsecase.ts` | 리뷰 저장          | Zod JSON 구조 검증 추가 (sanitize-html 대신)                        |
| `backend/review/application/usecase/UpdateReviewUsecase.ts` | 리뷰 수정          | 동일                                                                |
| `next.config.ts`                                            | Next.js 설정       | CSP headers() 추가 (`connect-src` 포함 — M-5 해결)                 |

### 에디터 관련 파일 (수정 대상)

| 파일                                                             | 역할                                        | 변경 내용                            |
| ---------------------------------------------------------------- | ------------------------------------------- | ------------------------------------ |
| `app/(base)/games/[gameId]/components/Comment.tsx`               | TipTap 에디터 (useEditor)                   | LexicalComposer + plugin 패턴으로 재작성 |
| `app/(base)/games/[gameId]/components/CommentEditorToolbar.tsx`  | 에디터 툴바                                 | ToolbarPlugin 사용으로 전환          |
| `app/(base)/games/[gameId]/components/extensions/CustomImage.ts` | TipTap 이미지 확장                          | **삭제** (ImageNode로 대체)          |
| `app/(base)/games/[gameId]/components/extensions/FontSize.ts`    | TipTap FontSize Mark                        | **삭제** ($patchStyleText로 대체)    |

### 신규 생성 파일

| 파일                                                                          | 역할                                               |
| ----------------------------------------------------------------------------- | -------------------------------------------------- |
| `app/(base)/games/[gameId]/components/lexical/nodes/ImageNode.tsx`            | Lexical 커스텀 DecoratorNode (base64 이미지)        |
| `app/(base)/games/[gameId]/components/lexical/nodes/index.ts`                 | 공유 노드 목록 (에디터 + 렌더러 동일 사용)         |
| `app/(base)/games/[gameId]/components/lexical/plugins/ToolbarPlugin.tsx`      | 툴바 플러그인 (useLexicalComposerContext 기반)      |
| `app/(base)/games/[gameId]/components/lexical/plugins/ImagePlugin.tsx`        | 이미지 업로드 플러그인 (readAsDataURL → ImageNode) |
| `app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx`             | read-only 렌더러 (LexicalComposer editable=false)  |
| `scripts/migrateReviewsToLexical.ts`                                          | DB 마이그레이션 스크립트 (HTML → Lexical JSON)     |

---

## 설치 패키지

### 추가

```bash
npm install lexical @lexical/react @lexical/rich-text @lexical/list @lexical/link \
            @lexical/code @lexical/history @lexical/utils @lexical/html

npm install --save-dev jsdom @types/jsdom   # 마이그레이션 스크립트용
```

### 제거 (마이그레이션 완료 후)

```bash
npm uninstall @tiptap/core @tiptap/starter-kit @tiptap/extension-image \
              @tiptap/extension-placeholder @tiptap/extension-react
```

> `sanitize-html`, `dompurify` 및 관련 `@types/*` — **불필요** (원래 계획 대비 변경)

---

## Plan Review 핵심 결과 요약

### 원래 계획(sanitize-html + DOMPurify)에서 발견된 Critical Issues

| ID | 문제 | Lexical으로 해결 방식 |
| -- | ---- | --------------------- |
| C-1 | `sanitize-html`의 `allowedStyles`/`allowedAttributes` 불일치 — `img` 스타일 필터링 오동작 | HTML 저장 안 함 → N/A |
| C-2 | DOMPurify 모듈 스코프 import → SSR에서 `window is not defined` → `next build` 실패 | DOMPurify 불필요 → N/A |
| C-3 | `ALLOWED_URI_REGEXP`의 `[^a-z]` 분기가 `//evil.com` 프로토콜 상대 URL 허용 | 링크는 Lexical `LinkNode`로 타입화 → N/A |

### 여전히 유효한 리스크 (Lexical 전환 후에도 처리 필요)

| ID | 문제 | 처리 방법 |
| -- | ---- | --------- |
| M-2 | CharacterCount 10,000자 제한이 기존 긴 리뷰 편집 차단 | 마이그레이션 전 `SELECT MAX(LENGTH(content)) FROM "Review"` 확인 |
| M-3 | 기존 오염된 DB HTML 콘텐츠 미처리 (→ 이제는 JSON 파싱 실패 문제) | `scripts/migrateReviewsToLexical.ts` 로 모든 리뷰 변환 필수 |
| M-4 | Usecase 테스트 미업데이트 (`CreateReviewUsecase.test.ts` 등) | Zod 검증 로직에 대한 테스트 케이스 추가 |
| M-5 | CSP `connect-src` 누락 → Socket.IO WebSocket 차단 가능 | `connect-src 'self' ws: wss:` 추가 (plan 1-L에 반영) |

---

## Lexical 데이터 모델

Lexical이 저장하는 EditorState JSON 구조 예시:

```json
{
    "root": {
        "children": [
            {
                "children": [
                    { "detail": 0, "format": 1, "mode": "normal", "style": "", "text": "볼드 텍스트", "type": "text", "version": 1 }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1
            }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "root",
        "version": 1
    }
}
```

- `format: 1` → Bold, `format: 2` → Italic, `format: 8` → Underline, `format: 4` → Strikethrough
- 이미지: `{ "type": "image", "src": "data:image/png;base64,...", "alt": "", "width": 300 }`
- 링크: `{ "type": "link", "url": "https://...", "children": [...] }`

---

## 의존성 및 제약사항

- **base64 이미지**: `readAsDataURL` 로직은 유지. ImageNode의 `src` 필드에 data URI 저장. DB 마이그레이션 시 기존 HTML `<img src="data:...">` → ImageNode 변환 검증 필수.
- **DB 스키마**: `Review.content` 컬럼 타입 변경 불필요 (TEXT/String으로 동일). 내용만 HTML → JSON으로 변경.
- **배포 전환**: 프론트(Lexical 에디터)와 백(Zod JSON 검증)을 동시 배포하여 전환 구간 최소화. 기존 HTML 콘텐츠가 `400`으로 거부되지 않도록 마이그레이션 스크립트 먼저 실행.
- **CSP**: framer-motion, Lottie 등이 `unsafe-inline` 스타일 사용 가능 → `Report-Only`로 먼저 적용.

---

## 관련 MASTER_PLAN 섹션

- `§2.3 XSS vulnerability` — 이 태스크의 핵심 취약점
- `§3.4 XSS Protection` — §2.3의 상세 구현 (Lexical 마이그레이션으로 접근 변경됨)
- `§7.2 Security Headers & Cookie Configuration` — CSP 헤더 관련 (부분 중복)
