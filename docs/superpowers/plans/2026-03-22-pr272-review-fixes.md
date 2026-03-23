# PR #272 Code Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all Critical and Important findings from the PR #272 code review, plus selected Minor items, before merging the XSS editor fix branch to `dev`.

**Architecture:** All fixes stay within the existing Clean Architecture layers — shared backend validation lives in a new utility file imported by both usecases; frontend fixes are local changes to `Comment.tsx`, `ReadOnlyReview.tsx`, and a new shared URL-matcher module. No new dependencies are introduced.

**Tech Stack:** Next.js 15 App Router, TypeScript, Lexical, Zod v4, Vitest 4.x

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `backend/review/application/usecase/validateReviewContent.ts` | **Create** | Shared validation: byte-size check, Zod parse, text-length, empty check, base64-image reject |
| `backend/review/application/usecase/CreateReviewUsecase.ts` | **Modify** | Remove local validation code, import from shared util |
| `backend/review/application/usecase/UpdateReviewUsecase.ts` | **Modify** | Remove local validation code, import from shared util |
| `backend/review/application/usecase/__tests__/CreateReviewUsecase.test.ts` | **Modify** | Add empty-content + base64 test cases |
| `backend/review/application/usecase/__tests__/UpdateReviewUsecase.test.ts` | **Modify** | Add empty-content + base64 test cases |
| `app/(base)/games/[gameId]/components/Comment.tsx` | **Modify** | Surface server errors in toast; wrap `editorConfig` in `useMemo`; add `defaultRating` prop |
| `app/(base)/games/[gameId]/components/ClientContentWrapper.tsx` | **Modify** | Pass `myComment?.rating` as `defaultRating` to `<Comment>` |
| `app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx` | **Modify** | Add `try/catch` JSON.parse with plain-text fallback |
| `app/(base)/games/[gameId]/components/lexical/urlMatchers.ts` | **Create** | Export `URL_REGEX` and `AUTOLINK_MATCHERS` |
| `app/(base)/games/[gameId]/components/Comment.tsx` | **Modify** (M4) | Import `URL_REGEX` / `AUTOLINK_MATCHERS` from shared module |
| `app/(base)/games/[gameId]/components/lexical/plugins/__tests__/ToolbarPlugin.test.ts` | **Modify** (M4) | Import `URL_REGEX` from shared module instead of duplicating |
| `app/(base)/games/[gameId]/components/lexical/nodes/ImageNode.tsx` | **Modify** (M1) | Add eslint-disable comment on `<img>` |
| `scripts/checkReviewEncoding.ts` | **Delete** (M3) | Diagnostic script with hardcoded gameId — no longer needed |

---

## Task 1: Create shared `validateReviewContent.ts` (I1 + C1 + C2)

**Goal:** Single source of truth for all review content validation. Fixes three findings at once:
- I1: no more copy-paste between Create/Update usecases
- C1: blank editor state no longer accepted (empty-root JSON has `textLength === 0`)
- C2: base64 image `src` rejected server-side before DB write

**Files:**
- Create: `backend/review/application/usecase/validateReviewContent.ts`

- [ ] **Step 1: Write the new shared module**

```typescript
// backend/review/application/usecase/validateReviewContent.ts
import { z } from "zod";

export const MAX_TEXT_LENGTH = 10_000;

export const LexicalEditorStateSchema = z.object({
    root: z.object({
        children: z.array(z.record(z.string(), z.unknown())),
        direction: z.string().nullable(),
        format: z.union([z.string(), z.number()]),
        indent: z.number(),
        type: z.literal("root"),
        version: z.number(),
    }),
});

export function extractTextContent(node: unknown): string {
    if (typeof node !== "object" || node === null) return "";
    const n = node as Record<string, unknown>;
    if (n.type === "text" && typeof n.text === "string") return n.text;
    if (Array.isArray(n.children)) {
        return (n.children as unknown[]).map(extractTextContent).join("");
    }
    return "";
}

/** Throws if any image node in the tree stores a data: URI (base64 bloat). */
function rejectBase64Images(node: unknown): void {
    if (typeof node !== "object" || node === null) return;
    const n = node as Record<string, unknown>;
    if (n.type === "image" && typeof n.src === "string" && n.src.startsWith("data:")) {
        throw new Error("이미지는 URL 형식으로만 삽입할 수 있습니다.");
    }
    if (Array.isArray(n.children)) {
        (n.children as unknown[]).forEach(rejectBase64Images);
    }
}

export function validateReviewContent(content: string): string {
    if (Buffer.byteLength(content, "utf8") > 500_000) {
        throw new Error("리뷰 콘텐츠가 너무 큽니다.");
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(content);
    } catch {
        throw new Error("유효하지 않은 콘텐츠 형식입니다.");
    }
    const validated = LexicalEditorStateSchema.parse(parsed);
    const textLength = extractTextContent(validated.root).length;
    if (textLength === 0) {
        throw new Error("리뷰 내용을 입력해주세요.");
    }
    if (textLength > MAX_TEXT_LENGTH) {
        throw new Error(`리뷰는 최대 ${MAX_TEXT_LENGTH.toLocaleString()}자까지 작성할 수 있습니다.`);
    }
    rejectBase64Images(validated.root);
    return content;
}
```

- [ ] **Step 2: Verify the file was created correctly**

```bash
npx tsc --noEmit 2>&1 | grep validateReviewContent
```
Expected: no output (no TS errors in this file).

---

## Task 2: Update usecases to import shared validation (I1)

**Files:**
- Modify: `backend/review/application/usecase/CreateReviewUsecase.ts`
- Modify: `backend/review/application/usecase/UpdateReviewUsecase.ts`

- [ ] **Step 1: Replace `CreateReviewUsecase.ts` with clean version**

Replace the entire file content:

```typescript
import { ReviewRepository } from "../../domain/repositories/ReviewRepository";
import { CreateReviewDto } from "./dto/CreateReviewDto";
import { ReviewDto } from "./dto/ReviewDto";
import { validateReviewContent } from "./validateReviewContent";

export class CreateReviewUsecase {
    constructor(private readonly reviewRepository: ReviewRepository) {}

    async execute(memberId: string, dto: CreateReviewDto): Promise<ReviewDto> {
        validateReviewContent(dto.content);

        const existing = await this.reviewRepository.findByMemberId(memberId);
        const hasAlreadyReviewed = existing.some(
            (review) => review.gameId === dto.gameId
        );

        if (hasAlreadyReviewed) {
            throw new Error("이미 이 게임에 대한 리뷰를 작성했습니다.");
        }

        return await this.reviewRepository.create(memberId, dto);
    }
}
```

- [ ] **Step 2: Replace `UpdateReviewUsecase.ts` with clean version**

```typescript
import { UpdateReviewDto } from "./dto/UpdateReviewDto";
import { ReviewDto } from "./dto/ReviewDto";
import { ReviewRepository } from "../../domain/repositories/ReviewRepository";
import { validateReviewContent } from "./validateReviewContent";

export class UpdateReviewUsecase {
    constructor(private readonly reviewRepository: ReviewRepository) {}

    async execute(reviewId: number, dto: UpdateReviewDto): Promise<ReviewDto> {
        validateReviewContent(dto.content);
        return this.reviewRepository.update(reviewId, dto);
    }
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors.

---

## Task 3: Add new test cases for C1 and C2 (Critical fixes)

**Files:**
- Modify: `backend/review/application/usecase/__tests__/CreateReviewUsecase.test.ts`
- Modify: `backend/review/application/usecase/__tests__/UpdateReviewUsecase.test.ts`

The existing tests already cover XSS payload, empty string, 500KB, invalid structure, and 10,000-char limit. We need to add:
1. Empty Lexical root (C1) — `{"root":{"children":[],...}}`
2. Base64 image node (C2) — valid JSON but image src starts with `data:`

**Helper constant** to add near the top of each test file (after `validLexicalJson`):

```typescript
const emptyLexicalJson = JSON.stringify({
    root: {
        children: [],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
    },
});

const base64ImageLexicalJson = JSON.stringify({
    root: {
        children: [
            {
                src: "data:image/png;base64,iVBORw0KGgo=",
                alt: "img",
                width: 300,
                type: "image",
                version: 1,
            },
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
    },
});
```

- [ ] **Step 1: Add test cases to `CreateReviewUsecase.test.ts`**

Append inside the `describe("CreateReviewUsecase", ...)` block:

```typescript
it("error: empty Lexical root (no text) throws", async () => {
    const repo = MockReviewRepository();
    const usecase = new CreateReviewUsecase(repo);
    await expect(
        usecase.execute("m1", { gameId: 10, content: emptyLexicalJson, rating: 3 })
    ).rejects.toThrow("리뷰 내용을 입력해주세요.");
});

it("error: base64 image src throws", async () => {
    const repo = MockReviewRepository();
    const usecase = new CreateReviewUsecase(repo);
    await expect(
        usecase.execute("m1", { gameId: 10, content: base64ImageLexicalJson, rating: 3 })
    ).rejects.toThrow("이미지는 URL 형식으로만 삽입할 수 있습니다.");
});
```

- [ ] **Step 2: Run only CreateReviewUsecase tests to confirm they pass**

```bash
npx vitest run backend/review/application/usecase/__tests__/CreateReviewUsecase.test.ts 2>&1 | tail -20
```
Expected: all tests PASS (the shared module from Task 1 already contains the new checks).

- [ ] **Step 3: Add test cases to `UpdateReviewUsecase.test.ts`**

Append inside the `describe("UpdateReviewUsecase", ...)` block:

```typescript
it("error: empty Lexical root (no text) throws", async () => {
    const repo = MockReviewRepository();
    const usecase = new UpdateReviewUsecase(repo);
    await expect(
        usecase.execute(1, { content: emptyLexicalJson, rating: 3 })
    ).rejects.toThrow("리뷰 내용을 입력해주세요.");
});

it("error: base64 image src throws", async () => {
    const repo = MockReviewRepository();
    const usecase = new UpdateReviewUsecase(repo);
    await expect(
        usecase.execute(1, { content: base64ImageLexicalJson, rating: 3 })
    ).rejects.toThrow("이미지는 URL 형식으로만 삽입할 수 있습니다.");
});
```

- [ ] **Step 4: Run all review usecase tests**

```bash
npx vitest run backend/review/application/usecase/__tests__/ 2>&1 | tail -30
```
Expected: all tests PASS (original 5 Create + 5 Update + 2+2 new = 14 total).

- [ ] **Step 5: Run full test suite to check for regressions**

```bash
npm test 2>&1 | tail -20
```
Expected: all 147+ tests pass.

- [ ] **Step 6: Commit backend changes**

```bash
git add backend/review/application/usecase/validateReviewContent.ts \
        backend/review/application/usecase/CreateReviewUsecase.ts \
        backend/review/application/usecase/UpdateReviewUsecase.ts \
        backend/review/application/usecase/__tests__/CreateReviewUsecase.test.ts \
        backend/review/application/usecase/__tests__/UpdateReviewUsecase.test.ts
git commit -m "fix: extract shared review validation, add empty-content and base64-image checks"
```

---

## Task 4: Surface server error messages in Comment.tsx (I2)

**Problem:** When the API returns `400 { message: "리뷰 내용을 입력해주세요." }`, `handleSubmit` in `Comment.tsx` throws a generic `Error("리뷰 수정 실패")` before reading the body. The user sees a generic toast instead of the server message.

**Files:**
- Modify: `app/(base)/games/[gameId]/components/Comment.tsx:172-175`

Current code at lines 172-175:
```typescript
if (!res.ok)
    throw new Error(
        isEditing ? "리뷰 수정 실패" : "리뷰 등록 실패"
    );
```

- [ ] **Step 1: Replace the `if (!res.ok)` block to read the body first**

Replace the current error-throw block (lines 172-175) with:

```typescript
if (!res.ok) {
    let serverMessage: string | undefined;
    try {
        const errData = await res.json();
        serverMessage = typeof errData?.message === "string" ? errData.message : undefined;
    } catch {
        // ignore json parse failure
    }
    throw new Error(serverMessage ?? (isEditing ? "리뷰 수정 실패" : "리뷰 등록 실패"));
}
```

- [ ] **Step 2: Update the catch block to use `err.message` in the toast**

After Step 1, any thrown error already has a user-facing message (either the server's or the generic fallback). Use it directly.

Current catch block (lines 179-188):
```typescript
} catch (err) {
    console.error("리뷰 저장 실패:", err);
    setToast({
        show: true,
        message: "리뷰 저장에 실패했습니다.",
        status: "error",
    });
```

Replace with:
```typescript
} catch (err) {
    console.error("리뷰 저장 실패:", err);
    setToast({
        show: true,
        message: err instanceof Error ? err.message : "리뷰 저장에 실패했습니다.",
        status: "error",
    });
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "Comment.tsx"
```
Expected: no errors.

---

## Task 5: Wrap `editorConfig` in `useMemo` (I3)

**Problem:** `editorConfig` is reconstructed on every render. `LexicalComposer` only reads `initialConfig` on mount so the config object is effectively stable, but recreating it on every render is wasteful and fragile.

**Files:**
- Modify: `app/(base)/games/[gameId]/components/Comment.tsx`

- [ ] **Step 1: Add `useMemo` to imports at top of file**

Find: `import React, { useRef, useState } from "react";`
Replace with: `import React, { useRef, useState, useMemo } from "react";`

- [ ] **Step 2: Wrap `editorConfig` in `useMemo`**

Current (lines 91-99):
```typescript
const editorConfig = {
    namespace: "review-editor",
    nodes: sharedNodes,
    editorState: defaultValue || null,
    onError(error: Error) {
        console.error(error);
    },
    theme: sharedTheme,
};
```

Replace with:
```typescript
const editorConfig = useMemo(
    () => ({
        namespace: "review-editor",
        nodes: sharedNodes,
        editorState: defaultValue || null,
        onError(error: Error) {
            console.error(error);
        },
        theme: sharedTheme,
    }),
    [defaultValue]
);
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "Comment.tsx"
```
Expected: no errors.

---

## Task 6: Restore star rating in edit mode (I5)

**Problem:** `Comment.tsx` initializes `rating` at `useState(0)`. In edit mode, the user must re-select their rating or the `rating <= 0` guard blocks submission. The fix is a `defaultRating` prop.

**Call chain:** `ClientContentWrapper` → passes `myComment?.rating` → `Comment` initializes state from it.

Note: `myComment.rating` in `ClientContentWrapper` is already divided by 2 (`r.rating / 2`), so it is a 0–5 display value. `handleSubmit` converts back: `Math.round(rating * 2)`.

**Files:**
- Modify: `app/(base)/games/[gameId]/components/Comment.tsx`
- Modify: `app/(base)/games/[gameId]/components/ClientContentWrapper.tsx`

- [ ] **Step 1: Add `defaultRating` to `CommentProps` in `Comment.tsx`**

Find the `CommentProps` interface (lines 28-34):
```typescript
interface CommentProps {
    gameId: string;
    editingReviewId?: number;
    defaultValue?: string;
    onSuccess: () => void;
    viewerId?: string | null;
}
```

Replace with:
```typescript
interface CommentProps {
    gameId: string;
    editingReviewId?: number;
    defaultValue?: string;
    defaultRating?: number;
    onSuccess: () => void;
    viewerId?: string | null;
}
```

- [ ] **Step 2: Destructure `defaultRating` and use it in `useState`**

Find (lines 68-79):
```typescript
export default function Comment({
    gameId,
    editingReviewId,
    defaultValue = "",
    onSuccess,
    viewerId,
}: CommentProps) {
    const router = useRouter();
    // TODO: rating not pre-populated in edit mode — user must re-select it.
    // Fix: accept a `defaultRating` prop and pass it as initial useState value,
    // then include the existing rating in the PATCH request body.
    const [rating, setRating] = useState(0);
```

Replace with:
```typescript
export default function Comment({
    gameId,
    editingReviewId,
    defaultValue = "",
    defaultRating = 0,
    onSuccess,
    viewerId,
}: CommentProps) {
    const router = useRouter();
    const [rating, setRating] = useState(defaultRating);
```

- [ ] **Step 3: Pass `defaultRating` from `ClientContentWrapper.tsx`**

Find in `ClientContentWrapper.tsx` (lines 151-163):
```typescript
<Comment
    gameId={String(gameId)}
    editingReviewId={editingId}
    defaultValue={myComment?.comment ?? ""}
    onSuccess={() => {
        fetchComments();
        setEditingId(null);
    }}
    viewerId={viewerId}
/>
```

Replace with:
```typescript
<Comment
    gameId={String(gameId)}
    editingReviewId={editingId}
    defaultValue={myComment?.comment ?? ""}
    defaultRating={myComment?.rating ?? 0}
    onSuccess={() => {
        fetchComments();
        setEditingId(null);
    }}
    viewerId={viewerId}
/>
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E "Comment|ClientContent"
```
Expected: no errors.

- [ ] **Step 5: Commit frontend fixes (I2, I3, I5)**

```bash
git add "app/(base)/games/[gameId]/components/Comment.tsx" \
        "app/(base)/games/[gameId]/components/ClientContentWrapper.tsx"
git commit -m "fix: surface server errors in toast, memoize editorConfig, restore rating in edit mode"
```

---

## Task 7: Add plain-text fallback to `ReadOnlyReview` (I4)

**Problem:** If `content` is an HTML string (pre-migration review) or the migration script failed for a record, `LexicalComposer` will silently render nothing. The user sees a blank card.

**Files:**
- Modify: `app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx`

- [ ] **Step 1: Rewrite `ReadOnlyReview.tsx` with JSON validation guard**

Replace entire file:

```typescript
"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { sharedNodes } from "./nodes";
import { sharedTheme } from "./sharedTheme";

interface ReadOnlyReviewProps {
    content: string;
}

function isLexicalJson(content: string): boolean {
    try {
        const parsed = JSON.parse(content);
        return typeof parsed?.root === "object" && parsed.root !== null;
    } catch {
        return false;
    }
}

export function ReadOnlyReview({ content }: ReadOnlyReviewProps) {
    if (!isLexicalJson(content)) {
        // Fallback: render as plain text for pre-migration HTML reviews or parse errors
        return (
            <p className="prose prose-sm max-w-full break-words text-sm text-font-200">
                {content}
            </p>
        );
    }

    const config = {
        namespace: "review-readonly",
        editorState: content,
        editable: false,
        nodes: sharedNodes,
        theme: sharedTheme,
        onError: (e: Error) => console.error(e),
    };

    return (
        <LexicalComposer initialConfig={config}>
            <RichTextPlugin
                contentEditable={
                    <ContentEditable className="prose prose-sm max-w-full break-words outline-none [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md" />
                }
                placeholder={null}
                ErrorBoundary={LexicalErrorBoundary}
            />
        </LexicalComposer>
    );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "ReadOnlyReview"
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx"
git commit -m "fix: add plain-text fallback in ReadOnlyReview for malformed/legacy content"
```

---

## Task 8: Minor fixes — ESLint disable, delete script, extract URL_REGEX (M1, M3, M4)

**Files:**
- Modify: `app/(base)/games/[gameId]/components/lexical/nodes/ImageNode.tsx`
- Create: `app/(base)/games/[gameId]/components/lexical/urlMatchers.ts`
- Modify: `app/(base)/games/[gameId]/components/Comment.tsx`
- Modify: `app/(base)/games/[gameId]/components/lexical/plugins/__tests__/ToolbarPlugin.test.ts`
- Delete: `scripts/checkReviewEncoding.ts`

- [ ] **Step 1 (M1): Add ESLint disable in `ImageNode.tsx`**

Find in `ImageNode.tsx` (line 66-67):
```typescript
    decorate(): JSX.Element {
        return (
            <img
```

Replace with:
```typescript
    decorate(): JSX.Element {
        return (
            // eslint-disable-next-line @next/next/no-img-element -- DecoratorNode cannot use next/image (no known dimensions or configured hostname)
            <img
```

- [ ] **Step 2 (M4): Create shared `urlMatchers.ts`**

```typescript
// app/(base)/games/[gameId]/components/lexical/urlMatchers.ts

export const URL_REGEX =
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

export const AUTOLINK_MATCHERS = [
    (text: string) => {
        const match = URL_REGEX.exec(text);
        if (!match) return null;
        const url = match[0];
        return {
            index: match.index,
            length: url.length,
            text: url,
            url: url.startsWith("http") ? url : `https://${url}`,
        };
    },
];
```

- [ ] **Step 3 (M4): Update `Comment.tsx` to import from shared module**

Remove from `Comment.tsx` (lines 51-66):
```typescript
const URL_REGEX =
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const AUTOLINK_MATCHERS = [
    (text: string) => {
        const match = URL_REGEX.exec(text);
        if (!match) return null;
        const url = match[0];
        return {
            index: match.index,
            length: url.length,
            text: url,
            url: url.startsWith("http") ? url : `https://${url}`,
        };
    },
];
```

Add import near the top of `Comment.tsx` (after the lexical plugin imports):
```typescript
import { AUTOLINK_MATCHERS } from "./lexical/urlMatchers";
```

- [ ] **Step 4 (M4): Update `ToolbarPlugin.test.ts` to import `URL_REGEX` from shared module**

Remove from `ToolbarPlugin.test.ts` (lines 3-5):
```typescript
// Mirrors the AutoLink URL detection logic in Comment.tsx (AUTOLINK_MATCHERS).
const URL_REGEX =
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
```

Add import at top of `ToolbarPlugin.test.ts`:
```typescript
import { URL_REGEX } from "../urlMatchers";
```

Also remove the comment on line 14:
```typescript
// Mirrors the LinkPlugin validateUrl in Comment.tsx:
//   validateUrl={(url) => /^https?:\/\//.test(url)}
```
(keep `function isValidLinkUrl` itself, just remove the "mirrors" comment since `URL_REGEX` is now the actual source)

- [ ] **Step 5 (M3): Delete the diagnostic script**

`git rm` both removes the file and stages the deletion in one command:
```bash
git rm scripts/checkReviewEncoding.ts
```

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 7: Run full test suite**

```bash
npm test 2>&1 | tail -20
```
Expected: all tests pass (new test count ≥ 151: 147 existing + 4 new usecase tests).

- [ ] **Step 8: Commit minor fixes**

Note: `scripts/checkReviewEncoding.ts` deletion was staged by `git rm` in Step 5 — no need to re-add it.

```bash
git add "app/(base)/games/[gameId]/components/lexical/nodes/ImageNode.tsx" \
        "app/(base)/games/[gameId]/components/lexical/urlMatchers.ts" \
        "app/(base)/games/[gameId]/components/Comment.tsx" \
        "app/(base)/games/[gameId]/components/lexical/plugins/__tests__/ToolbarPlugin.test.ts"
git commit -m "fix: eslint-disable on ImageNode img, extract URL_REGEX to shared module, delete diagnostic script"
```

---

## Final Verification

- [ ] **Run full test suite one more time**

```bash
npm test 2>&1 | tail -10
```
Expected: all tests pass.

- [ ] **Build check**

```bash
npm run build 2>&1 | tail -20
```
Expected: build succeeds (pre-commit hook will also run this).

- [ ] **Update PR body** to note:
  - KI-1 (star rating in edit mode) — **RESOLVED** in this branch
  - Base64 images are now rejected server-side; images must be externally hosted URLs
  - Deploy order remains: migrate DB first, then deploy code
