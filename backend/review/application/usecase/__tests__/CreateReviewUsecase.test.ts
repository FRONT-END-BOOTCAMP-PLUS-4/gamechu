import { describe, it, expect, vi } from "vitest";
import { CreateReviewUsecase } from "../CreateReviewUsecase";
import { MockReviewRepository } from "@/tests/mocks/MockReviewRepository";
import { ReviewDto } from "../dto/ReviewDto";
import { ReviewByMembersDto } from "../dto/ReviewByMembersDto";

const validLexicalJson = JSON.stringify({
    root: {
        children: [
            {
                children: [{ detail: 0, format: 0, mode: "normal", style: "", text: "Great game", type: "text", version: 1 }],
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

const mockReviewDto = {
    id: 1,
    gameId: 10,
    memberId: "m1",
    content: validLexicalJson,
    rating: 5,
    nickname: "tester",
    imageUrl: null,
    score: 100,
    likeCount: 0,
    isLiked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
} as unknown as ReviewDto;

describe("CreateReviewUsecase", () => {
    it("happy path: valid Lexical JSON creates review", async () => {
        const repo = MockReviewRepository();
        vi.mocked(repo.findByMemberId).mockResolvedValue([]);
        vi.mocked(repo.create).mockResolvedValue(mockReviewDto);

        const usecase = new CreateReviewUsecase(repo);
        const result = await usecase.execute("m1", {
            gameId: 10,
            content: validLexicalJson,
            rating: 5,
        });

        expect(repo.create).toHaveBeenCalledWith("m1", {
            gameId: 10,
            content: validLexicalJson,
            rating: 5,
        });
        expect(result.gameId).toBe(10);
    });

    it("error: duplicate review for same game throws", async () => {
        const repo = MockReviewRepository();
        vi.mocked(repo.findByMemberId).mockResolvedValue([
            { gameId: 10, id: 99, memberId: "m1" } as unknown as ReviewByMembersDto,
        ]);

        const usecase = new CreateReviewUsecase(repo);
        await expect(
            usecase.execute("m1", {
                gameId: 10,
                content: validLexicalJson,
                rating: 3,
            })
        ).rejects.toThrow("이미 이 게임에 대한 리뷰를 작성했습니다.");
    });

    it("error: XSS payload (non-JSON) throws", async () => {
        const repo = MockReviewRepository();
        const usecase = new CreateReviewUsecase(repo);
        await expect(
            usecase.execute("m1", {
                gameId: 10,
                content: "<script>alert(1)</script>",
                rating: 3,
            })
        ).rejects.toThrow("유효하지 않은 콘텐츠 형식입니다.");
    });

    it("error: empty string throws", async () => {
        const repo = MockReviewRepository();
        const usecase = new CreateReviewUsecase(repo);
        await expect(
            usecase.execute("m1", {
                gameId: 10,
                content: "",
                rating: 3,
            })
        ).rejects.toThrow("유효하지 않은 콘텐츠 형식입니다.");
    });

    it("error: content exceeding 500KB throws", async () => {
        const repo = MockReviewRepository();
        const usecase = new CreateReviewUsecase(repo);
        const largeContent = "x".repeat(500_001);
        await expect(
            usecase.execute("m1", {
                gameId: 10,
                content: largeContent,
                rating: 3,
            })
        ).rejects.toThrow("리뷰 콘텐츠가 너무 큽니다.");
    });

    it("error: invalid JSON structure (missing root) throws", async () => {
        const repo = MockReviewRepository();
        const usecase = new CreateReviewUsecase(repo);
        await expect(
            usecase.execute("m1", {
                gameId: 10,
                content: JSON.stringify({ notRoot: true }),
                rating: 3,
            })
        ).rejects.toThrow();
    });

    it("error: text content exceeding 10,000 chars throws", async () => {
        const repo = MockReviewRepository();
        const usecase = new CreateReviewUsecase(repo);
        const longText = "가".repeat(10_001);
        const content = JSON.stringify({
            root: {
                children: [
                    {
                        children: [{ detail: 0, format: 0, mode: "normal", style: "", text: longText, type: "text", version: 1 }],
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
            usecase.execute("m1", { gameId: 10, content, rating: 3 })
        ).rejects.toThrow("최대 10,000자");
    });
});
