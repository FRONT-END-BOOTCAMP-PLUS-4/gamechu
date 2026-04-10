// backend/review/application/usecase/validateReviewContent.ts
import { z } from "zod";

const MAX_TEXT_LENGTH = 10_000;

const LexicalEditorStateSchema = z.object({
    root: z.object({
        children: z.array(z.record(z.string(), z.unknown())),
        direction: z.string().nullable(),
        format: z.union([z.string(), z.number()]),
        indent: z.number(),
        type: z.literal("root"),
        version: z.number(),
    }),
});

function extractTextContent(node: unknown): string {
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
    if (
        n.type === "image" &&
        typeof n.src === "string" &&
        n.src.startsWith("data:")
    ) {
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
    rejectBase64Images(validated.root);
    const textLength = extractTextContent(validated.root).length;
    if (textLength === 0) {
        throw new Error("리뷰 내용을 입력해주세요.");
    }
    if (textLength > MAX_TEXT_LENGTH) {
        throw new Error(
            `리뷰는 최대 ${MAX_TEXT_LENGTH.toLocaleString()}자까지 작성할 수 있습니다.`
        );
    }
    return content;
}
