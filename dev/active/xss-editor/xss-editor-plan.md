# XSS 취약점 수정 및 리뷰 에디터 개선 계획

> Last Updated: 2026-03-17
> Branch: `fix/#266`
> **Decision**: TipTap → Lexical 마이그레이션 (2026-03-17 plan review 결과)

---

## Executive Summary

원래 계획은 두 개의 독립적인 작업(TipTap 위에 sanitize-html + DOMPurify로 XSS 패치 / 에디터 기능 추가)으로 구성되었으나, plan review에서 발견된 3개의 Critical Issue(C-1, C-2, C-3)가 모두 TipTap의 HTML 출력 방식에서 기인한다는 점을 확인했다.

**선택된 접근: TipTap → Lexical 마이그레이션**

Lexical(Meta)은 에디터 상태를 JSON 노드 트리로 저장한다. DB에 raw HTML을 저장하지 않으므로 C-1/C-2/C-3/M-6/M-7이 구조적으로 제거된다. 마이그레이션 비용(2–3일)은 향후 sanitize 레이어를 계속 유지 보수하는 비용보다 낮다.

**Plan Review Critical Issues 처리 결과**:

| Finding                                                                     | Lexical 전환 후 상태                      |
| --------------------------------------------------------------------------- | ----------------------------------------- |
| C-1: `allowedStyles`/`allowedAttributes` mismatch (sanitize-html 설정 오류) | ✅ 제거 — HTML 저장 없음                  |
| C-2: DOMPurify SSR crash → `next build` 실패                                | ✅ 제거 — DOMPurify 불필요                |
| C-3: `ALLOWED_URI_REGEXP` protocol-relative URL 허용                        | ✅ 제거 — 링크는 Lexical 타입 노드        |
| M-1: API route 레이어 sanitize 없음                                         | ✅ 변환 → Zod JSON 구조 검증으로 대체     |
| M-2: CharacterCount가 기존 긴 리뷰 편집 차단                                | ⚠️ 여전히 유효 — DB max(length) 확인 필요 |
| M-3: 기존 오염된 DB 콘텐츠 미처리                                           | 🔴 주요 위험 → DB 마이그레이션 필수       |
| M-4: Usecase 테스트 미업데이트                                              | ⚠️ 여전히 유효                            |
| M-5: CSP `connect-src` 누락 (Socket.IO 차단 가능)                           | ⚠️ 여전히 유효                            |
| M-6: TextStyle transitive dep (TipTap 버전 변경 시 깨짐)                    | ✅ 제거 — TipTap 제거                     |
| M-7: base64 이미지 sanitize 메모리 압박                                     | ✅ 제거 — sanitize-html 불필요            |

---

## 1. Current State Analysis

### 1.1 XSS 취약점 현황

#### 취약 위치 (확인됨)

| 파일                                                   | 라인 | 문제                                                                                                             |
| ------------------------------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------- |
| `app/(base)/games/[gameId]/components/CommentCard.tsx` | 239  | `dangerouslySetInnerHTML={{ __html: comment }}` — 처리 없음, 완전 노출                                           |
| `app/(base)/profile/components/MemberReviewItem.tsx`   | 119  | `dangerouslySetInnerHTML={{ __html: processedContent }}` — DOMParser는 `<img alt>` 추가만 하고 sanitize하지 않음 |

#### 데이터 흐름 분석 (현재 — 취약)

```
사용자 입력 (TipTap editor)
  → editor.getHTML()                      ← raw HTML 출력 (공격 벡터)
  → POST /api/member/games/[gameId]/reviews
  → CreateReviewUsecase.execute()         ← sanitize 없음
  → PostgreSQL DB (raw HTML 저장)
  → CommentCard.tsx:239 dangerouslySetInnerHTML  ← 악성 HTML 실행
```

#### 심각도: HIGH

인증된 사용자 세션 탈취, CSRF, 데이터 삭제 가능. 리뷰 페이지를 방문하는 모든 사용자에게 영향.

### 1.2 현재 에디터 현황

**설치된 TipTap 패키지** (마이그레이션 후 제거 예정):

```json
"@tiptap/core": "^2.26.1"
"@tiptap/extension-image": "^2.26.1"
"@tiptap/extension-placeholder": "^2.25.0"
"@tiptap/extension-react": "^2.26.1"
"@tiptap/starter-kit": "^2.25.0"
```

커스텀 확장: `CustomImage` (width 속성), `FontSize` (custom Mark), `TextStyle`

**현재 툴바**: Bold | Italic | 12px/24px 토글 | 이미지 업로드 | 이미지 +50/-50 | 초기화

**미노출 StarterKit 기능**: Heading H1-H3, Strike, BulletList, OrderedList, Blockquote, CodeBlock, HorizontalRule, Undo/Redo

---

## 2. Proposed Future State

### 2.1 아키텍처 변화 (TipTap HTML → Lexical JSON)

```
사용자 입력 (Lexical editor)
  → editor.getEditorState().toJSON()     ← 구조화된 JSON (XSS 벡터 없음)
  → POST /api/member/games/[gameId]/reviews
  → CreateReviewUsecase.execute()        ← Zod JSON 구조 검증
  → PostgreSQL DB (Lexical EditorState JSON 저장)
  → ReadOnlyReview.tsx                   ← LexicalComposer read-only 렌더링
                                            (dangerouslySetInnerHTML 제거)
```

**보안 향상 근거**: Lexical은 에디터 상태를 `{ root: { children: [...] } }` 형태의 typed node tree로 직렬화한다. HTML attribute injection, `<script>` 태그, `onerror` 핸들러 등은 JSON 노드 모델에 표현될 수 없다. 공격자가 API로 악성 HTML을 직접 전송해도 Zod JSON 검증에서 차단된다.

### 2.2 에디터 개선 후

- Heading (H1/H2/H3), Strike, Underline, BulletList, OrderedList, Blockquote, CodeBlock, HorizontalRule 툴바 노출
- Undo/Redo 버튼 추가 (HistoryPlugin)
- Font Size Select 드롭다운 (12/14/16/18/20/24/32px)
- 링크 삽입 (https:// 프로토콜만, LinkPlugin)
- 글자 수 표시 (현재 / 10,000자, 9000자+ 경고색)
- 모든 툴바 버튼 `aria-label` 추가
- 모바일 overflow-x-auto 처리

---

## 3. Implementation Phases

---

### Phase 1: Lexical 마이그레이션 (XSS 수정 포함)

> **이 Phase가 완료되면 XSS 취약점이 구조적으로 제거된다.**

#### Phase 1-A: Lexical 패키지 설치

```bash
npm install lexical @lexical/react @lexical/rich-text @lexical/list @lexical/link \
            @lexical/code @lexical/history @lexical/utils @lexical/html
```

| 패키지               | 역할                                                  |
| -------------------- | ----------------------------------------------------- |
| `lexical`            | 코어 에디터 상태 / 노드 모델                          |
| `@lexical/react`     | LexicalComposer, 플러그인 React 바인딩                |
| `@lexical/rich-text` | RichTextPlugin (기본 서식)                            |
| `@lexical/list`      | ListPlugin, ListNode, ListItemNode                    |
| `@lexical/link`      | LinkPlugin, AutoLinkPlugin, LinkNode                  |
| `@lexical/code`      | CodeNode, CodeHighlightNode                           |
| `@lexical/history`   | HistoryPlugin (Undo/Redo)                             |
| `@lexical/utils`     | mergeRegister 등 유틸리티                             |
| `@lexical/html`      | `$generateHtmlFromNodes` (DB 마이그레이션 스크립트용) |

#### Phase 1-B: Lexical 커스텀 ImageNode 구현

Lexical에는 기본 ImageNode가 없다. TipTap의 `CustomImage` 역할을 대체하는 커스텀 `DecoratorNode` 구현이 필요하다.

**생성 파일**: `app/(base)/games/[gameId]/components/lexical/nodes/ImageNode.tsx`

```typescript
import { DecoratorNode, type LexicalNode, type NodeKey, type SerializedLexicalNode } from "lexical";
import { type JSX } from "react";

export type SerializedImageNode = SerializedLexicalNode & {
    src: string;
    alt: string;
    width: number;
    type: "image";
    version: 1;
};

export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;
    __alt: string;
    __width: number;

    static getType(): string { return "image"; }
    static clone(node: ImageNode): ImageNode {
        return new ImageNode(node.__src, node.__alt, node.__width, node.__key);
    }
    static importJSON(json: SerializedImageNode): ImageNode {
        return new ImageNode(json.src, json.alt, json.width);
    }

    constructor(src: string, alt: string, width: number = 300, key?: NodeKey) {
        super(key);
        this.__src = src;
        this.__alt = alt;
        this.__width = width;
    }

    createDOM(): HTMLElement { return document.createElement("span"); }
    updateDOM(): false { return false; }

    exportJSON(): SerializedImageNode {
        return { src: this.__src, alt: this.__alt, width: this.__width, type: "image", version: 1 };
    }

    decorate(): JSX.Element {
        return <img src={this.__src} alt={this.__alt} width={this.__width} style={{ maxWidth: "100%" }} />;
    }
}
```

**생성 파일**: `app/(base)/games/[gameId]/components/lexical/nodes/index.ts` — 공유 노드 목록 export (에디터 + 렌더러 모두 사용)

#### Phase 1-C: Comment.tsx 에디터 재작성

`useEditor` 패턴(TipTap) → `LexicalComposer` + plugin 패턴(Lexical)으로 전환.

**핵심 구조**:

```tsx
// "use client"
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { ImageNode } from "./lexical/nodes/ImageNode";
import { ToolbarPlugin } from "./lexical/plugins/ToolbarPlugin";
import { ImagePlugin } from "./lexical/plugins/ImagePlugin";

const editorConfig = {
    namespace: "review-editor",
    nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        LinkNode,
        AutoLinkNode,
        CodeNode,
        CodeHighlightNode,
        ImageNode,
    ],
    onError(error: Error) {
        console.error(error);
    },
    theme: {
        /* TailwindCSS prose 클래스 매핑 */
    },
};

// submit 시: editor.getEditorState().toJSON() → JSON.stringify() → API 전송
```

**이미지 업로드**: 기존 `readAsDataURL` base64 로직을 `ImagePlugin`으로 이전. ImageNode의 `src`에 data URI 저장.

#### Phase 1-D: CommentEditorToolbar.tsx 재작성 (ToolbarPlugin)

Lexical에서 툴바는 **플러그인** 패턴이다. `useLexicalComposerContext()`로 editor 인스턴스에 접근한다.

**생성 파일**: `app/(base)/games/[gameId]/components/lexical/plugins/ToolbarPlugin.tsx`

**행 1 (텍스트 서식)**: Undo | Redo | Bold | Italic | Underline | Strike | H1 | H2 | H3 | BulletList | OrderedList | Blockquote

**행 2 (미디어/편의)**: Font Size Select (12/14/16/18/20/24/32px) | Image Upload | Link | Clear

> Font Size 구현: `editor.dispatchCommand(FORMAT_TEXT_COMMAND, ...)` 방식으로는 font-size를 직접 지원하지 않는다. `$patchStyleText`를 사용하여 선택된 텍스트에 `font-size` 인라인 스타일을 적용한다. (TipTap FontSize Mark와 동일한 접근)

#### Phase 1-E: CommentCard.tsx 렌더러 재작성

`dangerouslySetInnerHTML` 제거 → Lexical read-only 렌더러로 교체.

**생성 파일**: `app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx`

```tsx
// "use client"
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

export function ReadOnlyReview({ content }: { content: string }) {
    const config = {
        namespace: "review-readonly",
        editorState: content, // Lexical JSON string
        editable: false,
        nodes: [
            /* 공유 노드 목록 */
        ],
        onError: (e: Error) => console.error(e),
    };
    return (
        <LexicalComposer initialConfig={config}>
            <RichTextPlugin
                contentEditable={<ContentEditable className="prose text-sm" />}
                placeholder={null}
                ErrorBoundary={({ children }) => <>{children}</>}
            />
        </LexicalComposer>
    );
}
```

`CommentCard.tsx:239`의 `dangerouslySetInnerHTML` 블록을 `<ReadOnlyReview content={comment} />`로 교체.

#### Phase 1-F: MemberReviewItem.tsx 렌더러 재작성

동일하게 `dangerouslySetInnerHTML` → `<ReadOnlyReview />` 교체.

기존의 `processedContent` useMemo (DOMParser로 `<img alt>` 채우는 로직)도 제거 — Lexical ImageNode의 `alt` 필드가 이미 구조화되어 있어 불필요.

#### Phase 1-G: Usecase 레이어 업데이트 (Zod JSON 검증)

`sanitize-html` 대신 Zod로 Lexical EditorState JSON의 구조를 검증한다.

```typescript
// backend/review/application/usecase/CreateReviewUsecase.ts

import { z } from "zod";

// Lexical EditorState 최소 구조 검증
const LexicalEditorStateSchema = z.object({
    root: z.object({
        children: z.array(z.record(z.unknown())),
        direction: z.string().nullable(),
        format: z.string(),
        indent: z.number(),
        type: z.literal("root"),
        version: z.number(),
    }),
});

function validateReviewContent(content: string): string {
    // 1. 크기 제한 (base64 이미지 포함 최대 500KB)
    if (Buffer.byteLength(content, "utf8") > 500_000) {
        throw new Error("리뷰 콘텐츠가 너무 큽니다.");
    }
    // 2. JSON 파싱 가능 여부
    let parsed: unknown;
    try {
        parsed = JSON.parse(content);
    } catch {
        throw new Error("유효하지 않은 콘텐츠 형식입니다.");
    }
    // 3. Lexical 구조 검증
    LexicalEditorStateSchema.parse(parsed);
    return content;
}
```

`CreateReviewUsecase.execute()` 및 `UpdateReviewUsecase.execute()` 내에서 `dto.content = validateReviewContent(dto.content)` 적용.

> **참고 (M-2 해결)**: `validateReviewContent` 내에서 Lexical JSON의 텍스트 길이를 체크할 수 있다. 단, 에디터에서 CharacterCount로 이미 제한하므로 서버에서는 크기(byte)만 체크하면 충분하다.

#### Phase 1-H: DB 마이그레이션 스크립트 (HTML → Lexical JSON)

기존 DB의 모든 리뷰 `content`가 raw HTML 문자열이다. Lexical 마이그레이션 후에는 이 데이터를 Lexical JSON으로 변환해야 한다.

> **이 단계가 없으면 기존 리뷰가 ReadOnlyReview 컴포넌트에서 렌더링되지 않는다 (JSON parse 실패).**

**생성 파일**: `scripts/migrateReviewsToLexical.ts`

```typescript
import { createHeadlessEditor } from "@lexical/headless";
import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes } from "lexical";
import { JSDOM } from "jsdom"; // devDependency로 설치
import { prisma } from "@/lib/prisma";
// ImageNode 등 커스텀 노드도 등록 필요

const editor = createHeadlessEditor({
    nodes: [
        /* 전체 노드 목록 */
    ],
    onError: (e) => {
        throw e;
    },
});

async function migrate() {
    const reviews = await prisma.review.findMany({
        select: { id: true, content: true },
    });
    console.log(`마이그레이션 대상: ${reviews.length}건`);

    for (const review of reviews) {
        // 이미 Lexical JSON이면 건너뜀
        try {
            const parsed = JSON.parse(review.content);
            if (parsed?.root) continue;
        } catch {
            /* HTML — 변환 진행 */
        }

        const dom = new JSDOM(review.content);
        let lexicalJson = "";

        await new Promise<void>((resolve) => {
            editor.update(
                () => {
                    const nodes = $generateNodesFromDOM(
                        editor,
                        dom.window.document.body
                    );
                    $getRoot().clear();
                    $insertNodes(nodes);
                },
                {
                    onUpdate: () => {
                        lexicalJson = JSON.stringify(
                            editor.getEditorState().toJSON()
                        );
                        resolve();
                    },
                }
            );
        });

        await prisma.review.update({
            where: { id: review.id },
            data: { content: lexicalJson },
        });
    }
    console.log("마이그레이션 완료");
}

migrate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
```

**실행**:

```bash
npm install --save-dev jsdom @types/jsdom
npx tsx scripts/migrateReviewsToLexical.ts
```

> ⚠️ **중요**: 마이그레이션 전 DB 백업 필수. 스테이징 환경에서 먼저 검증 후 프로덕션 실행.

#### Phase 1-I: CSP 헤더 추가 (next.config.ts)

plan review M-5에서 지적된 `connect-src` 누락을 포함하여 올바른 CSP를 설정한다.

```typescript
// next.config.ts — headers() 추가
async headers() {
    return [
        {
            source: "/(.*)",
            headers: [
                {
                    key: "Content-Security-Policy-Report-Only",
                    value: [
                        "default-src 'self'",
                        "script-src 'self'",
                        "style-src 'self' 'unsafe-inline'",    // framer-motion, Lottie
                        "img-src 'self' data: https:",
                        "font-src 'self'",
                        "connect-src 'self' ws: wss:",         // Socket.IO (M-5 해결)
                    ].join("; "),
                },
            ],
        },
    ];
},
```

> `Content-Security-Policy-Report-Only`로 먼저 적용하여 위반 사항을 브라우저 콘솔에서 모니터링한다. 전체 적용은 별도 이슈로 추적.

#### Phase 1-J: TipTap 패키지 제거

마이그레이션 완료 및 검증 후:

```bash
npm uninstall @tiptap/core @tiptap/starter-kit @tiptap/extension-image \
              @tiptap/extension-placeholder @tiptap/extension-react
```

삭제 파일:

- `app/(base)/games/[gameId]/components/extensions/CustomImage.ts`
- `app/(base)/games/[gameId]/components/extensions/FontSize.ts`

---

### Phase 2: 에디터 기능 개선 (Lexical 플러그인)

> Phase 1 완료 후 진행. Lexical의 플러그인 시스템으로 원래 계획했던 모든 기능을 구현한다.

#### Phase 2-A: Heading, Strike, Underline, Blockquote

`RichTextPlugin`에 기본 포함. `HeadingNode`, `QuoteNode`는 Phase 1-A에서 이미 등록됨.

툴바에 버튼만 추가:

- `editor.dispatchCommand(FORMAT_HEADING_COMMAND, "h1")` → H1/H2/H3
- `editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")` → 취소선
- `editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")` → 밑줄
- `editor.dispatchCommand(INSERT_QUOTE_COMMAND, undefined)` → 인용구

#### Phase 2-B: 리스트 (BulletList, OrderedList)

`ListPlugin` 이미 Phase 1-C에서 포함. 툴바 버튼 추가:

- `editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)`
- `editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)`

#### Phase 2-C: 링크 (LinkPlugin)

`LinkPlugin` Phase 1-C에서 포함. URL validation 설정:

```typescript
<LinkPlugin validateUrl={(url) => /^https?:\/\//.test(url)} />
```

툴바 링크 버튼: URL input 팝업 → `editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)`.

#### Phase 2-D: Font Size Select 드롭다운

`$patchStyleText(selection, { "font-size": "16px" })` 사용. 드롭다운 옵션: 12, 14, 16(기본), 18, 20, 24, 32px.

현재 선택 영역의 font-size 반영: `$getSelectionStyleValueForProperty(selection, "font-size", "16px")`.

#### Phase 2-E: 글자 수 표시

```tsx
// OnChangePlugin으로 문자 수 추적
<OnChangePlugin onChange={(editorState) => {
    editorState.read(() => {
        const text = $getRoot().getTextContent();
        setCharCount(text.length);
    });
}} />

// 표시
<span className={charCount >= 9000 ? "text-yellow-500" : charCount >= 10000 ? "text-red-500" : "text-gray-400"}>
    {charCount} / 10,000
</span>
```

> **M-2 해결**: Phase 1 전에 `SELECT MAX(LENGTH(content)) FROM "Review"` 실행하여 10,000자 제한이 안전한지 확인. 초과 시 limit 상향 조정.

---

## 4. Risk Assessment

### 마이그레이션 리스크

| 리스크                                                                                       | 심각도     | 완화 방법                                                                             |
| -------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| DB 마이그레이션 스크립트 오류로 기존 리뷰 데이터 손실                                        | **HIGH**   | 실행 전 DB 백업; 스테이징 먼저 검증; 배치 단위로 처리                                 |
| `$generateNodesFromDOM`이 기존 HTML을 잘못 파싱                                              | **MEDIUM** | 샘플 리뷰 10-20건으로 사전 테스트; base64 `<img>` 파싱 집중 검증                      |
| 마이그레이션 배포 시 전환 구간 — 구 클라이언트(TipTap)가 HTML 전송, 신 서버(Zod 검증)가 거부 | **MEDIUM** | Zod 검증에서 HTML 문자열을 감지 시 `400` 반환; 프론트-백 동시 배포로 전환 구간 최소화 |
| Lexical read-only 인스턴스가 리뷰 목록 페이지에서 다수 생성 시 성능 저하                     | **MEDIUM** | 리뷰 카드 가상화(react-window) 또는 초기 로드 수 제한; 실제 성능 측정 후 결정         |
| CharacterCount 10,000자 제한이 기존 긴 리뷰 편집 차단 (M-2)                                  | **MEDIUM** | 마이그레이션 전 `SELECT MAX(LENGTH(content)) FROM "Review"` 확인                      |
| CSP `style-src 'unsafe-inline'` 임시 허용 (framer-motion 등)                                 | **LOW**    | Report-Only 모드로 모니터링; 전체 적용은 별도 이슈로 추적                             |

### 에디터 개선 리스크

| 리스크                                                     | 심각도 | 완화 방법                                |
| ---------------------------------------------------------- | ------ | ---------------------------------------- |
| 새 툴바 레이아웃이 모바일에서 넘칠 수 있음                 | LOW    | `overflow-x-auto` 적용, 실기기 테스트    |
| Font Size `$patchStyleText` API가 Lexical 버전에 따라 변경 | LOW    | Lexical 버전 고정; 패키지 lock 파일 준수 |

---

## 5. Success Metrics

### Phase 1: Lexical 마이그레이션 (XSS 수정)

- [ ] DB에 저장되는 리뷰 콘텐츠가 Lexical JSON 형태임 (`root.children` 구조 확인)
- [ ] API에 `<script>alert(1)</script>` 직접 전송 시 `400` 반환
- [ ] `CommentCard.tsx`에서 `dangerouslySetInnerHTML` 사용 없음
- [ ] `MemberReviewItem.tsx`에서 `dangerouslySetInnerHTML` 사용 없음
- [ ] 기존 DB 리뷰 데이터가 `ReadOnlyReview`에서 정상 렌더링됨 (마이그레이션 후)
- [ ] `next build` 성공 (pre-commit hook 통과)
- [ ] CSP Report-Only 헤더가 응답에 포함됨

### Phase 2: 에디터 기능 개선

- [ ] Heading H1/H2/H3 적용 및 저장/렌더링 정상
- [ ] 불릿/번호 리스트 정상
- [ ] Underline, Strike 정상
- [ ] Undo/Redo 버튼 작동
- [ ] Font Size Select 드롭다운 (12/14/16/18/20/24/32px) 정상
- [ ] 링크 삽입 (https:// 프로토콜만) 정상
- [ ] 글자 수 `현재 / 10,000` 표시 정상 (9000자+ 경고색)
- [ ] 모바일에서 툴바 overflow-x-auto 처리

---

## 6. Required Resources and Dependencies

### 설치 패키지

```bash
# Lexical 마이그레이션
npm install lexical @lexical/react @lexical/rich-text @lexical/list @lexical/link \
            @lexical/code @lexical/history @lexical/utils @lexical/html

# DB 마이그레이션 스크립트용 (devDependency)
npm install --save-dev jsdom @types/jsdom

# TipTap 제거 (마이그레이션 완료 후)
npm uninstall @tiptap/core @tiptap/starter-kit @tiptap/extension-image \
              @tiptap/extension-placeholder @tiptap/extension-react
```

> `sanitize-html`, `dompurify`, `@types/sanitize-html`, `@types/dompurify` — **설치 불필요** (원래 계획 대비 변경)

### 수정/생성 파일

**Phase 1 — Lexical 마이그레이션**:

| 파일                                                                     | 작업                                                     |
| ------------------------------------------------------------------------ | -------------------------------------------------------- |
| `app/(base)/games/[gameId]/components/lexical/nodes/ImageNode.tsx`       | 신규 — Lexical 커스텀 ImageNode                          |
| `app/(base)/games/[gameId]/components/lexical/nodes/index.ts`            | 신규 — 공유 노드 목록                                    |
| `app/(base)/games/[gameId]/components/lexical/plugins/ToolbarPlugin.tsx` | 신규 — 툴바 플러그인                                     |
| `app/(base)/games/[gameId]/components/lexical/plugins/ImagePlugin.tsx`   | 신규 — 이미지 업로드 플러그인                            |
| `app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx`        | 신규 — read-only 렌더러                                  |
| `app/(base)/games/[gameId]/components/Comment.tsx`                       | 수정 — LexicalComposer로 전환                            |
| `app/(base)/games/[gameId]/components/CommentEditorToolbar.tsx`          | 수정 — ToolbarPlugin 사용으로 전환                       |
| `app/(base)/games/[gameId]/components/CommentCard.tsx`                   | 수정 — dangerouslySetInnerHTML 제거, ReadOnlyReview 사용 |
| `app/(base)/profile/components/MemberReviewItem.tsx`                     | 수정 — 동일                                              |
| `backend/review/application/usecase/CreateReviewUsecase.ts`              | 수정 — Zod JSON 검증                                     |
| `backend/review/application/usecase/UpdateReviewUsecase.ts`              | 수정 — 동일                                              |
| `next.config.ts`                                                         | 수정 — CSP headers() 추가                                |
| `scripts/migrateReviewsToLexical.ts`                                     | 신규 — DB 마이그레이션 스크립트                          |
| `app/(base)/games/[gameId]/components/extensions/CustomImage.ts`         | 삭제 (Phase 1-J)                                         |
| `app/(base)/games/[gameId]/components/extensions/FontSize.ts`            | 삭제 (Phase 1-J)                                         |

---

## 7. Execution Order

```
Phase 1 (Lexical Migration):
  1-A: Lexical 패키지 설치
  1-B: ImageNode 구현 (lexical/nodes/)
  1-C: Comment.tsx → LexicalComposer 재작성
  1-D: ToolbarPlugin.tsx 기본 구현 (Bold/Italic만 먼저)
  1-E: ReadOnlyReview.tsx 구현
  1-F: CommentCard.tsx dangerouslySetInnerHTML → ReadOnlyReview
  1-G: MemberReviewItem.tsx 동일
  1-H: CreateReviewUsecase + UpdateReviewUsecase Zod 검증 추가
  1-I: [pre-migration] SELECT MAX(LENGTH(content)) FROM "Review" 확인
  1-J: scripts/migrateReviewsToLexical.ts 작성 및 스테이징 검증
  1-K: DB 마이그레이션 실행 (프로덕션)
  1-L: next.config.ts CSP headers 추가 (connect-src 포함)
  1-M: TipTap 패키지 제거 + 확장 파일 삭제

Phase 2 (Editor Improvements):
  2-A: ToolbarPlugin 확장 (Heading/Strike/Underline/List/Blockquote 버튼)
  2-B: LinkPlugin + 링크 삽입 UI
  2-C: Font Size Select 드롭다운 ($patchStyleText)
  2-D: 글자 수 표시 (OnChangePlugin)
  2-E: aria-label 전체 추가
  2-F: 모바일 overflow-x-auto 처리

두 Phase는 1이 완료된 후 2 진행. Phase 1-J (DB 마이그레이션)는 Phase 1의 가장 위험한 단계 — 스테이징 먼저 검증 필수.
```
