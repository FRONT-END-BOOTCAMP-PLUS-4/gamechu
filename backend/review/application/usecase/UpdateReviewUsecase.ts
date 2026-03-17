import { z } from "zod";
import { UpdateReviewDto } from "./dto/UpdateReviewDto";
import { ReviewDto } from "./dto/ReviewDto";
import { ReviewRepository } from "../../domain/repositories/ReviewRepository";

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

function validateReviewContent(content: string): string {
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
    if (textLength > MAX_TEXT_LENGTH) {
        throw new Error(`리뷰는 최대 ${MAX_TEXT_LENGTH.toLocaleString()}자까지 작성할 수 있습니다.`);
    }
    return content;
}

export class UpdateReviewUsecase {
    constructor(private readonly reviewRepository: ReviewRepository) {}

    async execute(reviewId: number, dto: UpdateReviewDto): Promise<ReviewDto> {
        validateReviewContent(dto.content);
        return this.reviewRepository.update(reviewId, dto);
    }
}
