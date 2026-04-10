import { describe, it, expect, vi } from "vitest";
import { UpdateReviewUsecase } from "../UpdateReviewUsecase";
import { createMockReviewRepository } from "@/tests/mocks/createMockReviewRepository";
import { ReviewDto } from "../dto/ReviewDto";

const validLexicalJson = JSON.stringify({
    root: {
        children: [
            {
                children: [
                    {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Updated content",
                        type: "text",
                        version: 1,
                    },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
            },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
    },
});

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

describe("UpdateReviewUsecase", () => {
    it("delegates to repository.update with valid Lexical JSON", async () => {
        const repo = createMockReviewRepository();
        const updatedDto = {
            id: 1,
            content: validLexicalJson,
            rating: 4,
        } as unknown as ReviewDto;
        vi.mocked(repo.update).mockResolvedValue(updatedDto);

        const usecase = new UpdateReviewUsecase(repo);
        const result = await usecase.execute(1, {
            content: validLexicalJson,
            rating: 4,
        });

        expect(repo.update).toHaveBeenCalledWith(1, {
            content: validLexicalJson,
            rating: 4,
        });
        expect(result.content).toBe(validLexicalJson);
    });

    it("error: XSS payload (non-JSON) throws", async () => {
        const repo = createMockReviewRepository();
        const usecase = new UpdateReviewUsecase(repo);
        await expect(
            usecase.execute(1, {
                content: "<script>alert(1)</script>",
                rating: 3,
            })
        ).rejects.toThrow("유효하지 않은 콘텐츠 형식입니다.");
    });

    it("error: empty string throws", async () => {
        const repo = createMockReviewRepository();
        const usecase = new UpdateReviewUsecase(repo);
        await expect(
            usecase.execute(1, {
                content: "",
                rating: 3,
            })
        ).rejects.toThrow("유효하지 않은 콘텐츠 형식입니다.");
    });

    it("error: content exceeding 500KB throws", async () => {
        const repo = createMockReviewRepository();
        const usecase = new UpdateReviewUsecase(repo);
        const largeContent = "x".repeat(500_001);
        await expect(
            usecase.execute(1, {
                content: largeContent,
                rating: 3,
            })
        ).rejects.toThrow("리뷰 콘텐츠가 너무 큽니다.");
    });

    it("error: empty Lexical root (no text) throws", async () => {
        const repo = createMockReviewRepository();
        const usecase = new UpdateReviewUsecase(repo);
        await expect(
            usecase.execute(1, { content: emptyLexicalJson, rating: 3 })
        ).rejects.toThrow("리뷰 내용을 입력해주세요.");
    });

    it("error: base64 image src throws", async () => {
        const repo = createMockReviewRepository();
        const usecase = new UpdateReviewUsecase(repo);
        await expect(
            usecase.execute(1, { content: base64ImageLexicalJson, rating: 3 })
        ).rejects.toThrow("이미지는 URL 형식으로만 삽입할 수 있습니다.");
    });

    it("error: invalid JSON structure (missing root) throws", async () => {
        const repo = createMockReviewRepository();
        const usecase = new UpdateReviewUsecase(repo);
        await expect(
            usecase.execute(1, {
                content: JSON.stringify({ notRoot: true }),
                rating: 3,
            })
        ).rejects.toThrow();
    });

    it("error: text content exceeding 10,000 chars throws", async () => {
        const repo = createMockReviewRepository();
        const usecase = new UpdateReviewUsecase(repo);
        const longText = "가".repeat(10_001);
        const content = JSON.stringify({
            root: {
                children: [
                    {
                        children: [
                            {
                                detail: 0,
                                format: 0,
                                mode: "normal",
                                style: "",
                                text: longText,
                                type: "text",
                                version: 1,
                            },
                        ],
                        direction: "ltr",
                        format: "",
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                    },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "root",
                version: 1,
            },
        });
        await expect(
            usecase.execute(1, { content, rating: 3 })
        ).rejects.toThrow("최대 10,000자");
    });
});
