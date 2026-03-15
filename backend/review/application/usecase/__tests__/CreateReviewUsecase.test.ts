import { describe, it, expect, vi } from "vitest";
import { CreateReviewUsecase } from "../CreateReviewUsecase";
import { MockReviewRepository } from "@/tests/mocks/MockReviewRepository";

const mockReviewDto = {
    id: 1,
    gameId: 10,
    memberId: "m1",
    content: "Great game",
    rating: 5,
    nickname: "tester",
    imageUrl: null,
    score: 100,
    likeCount: 0,
    isLiked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
} as any;

describe("CreateReviewUsecase", () => {
    it("happy path: new review for game creates review", async () => {
        const repo = MockReviewRepository();
        vi.mocked(repo.findByMemberId).mockResolvedValue([]);
        vi.mocked(repo.create).mockResolvedValue(mockReviewDto);

        const usecase = new CreateReviewUsecase(repo);
        const result = await usecase.execute("m1", {
            gameId: 10,
            content: "Great game",
            rating: 5,
        });

        expect(repo.create).toHaveBeenCalledWith("m1", {
            gameId: 10,
            content: "Great game",
            rating: 5,
        });
        expect(result.gameId).toBe(10);
    });

    it("error: duplicate review for same game throws", async () => {
        const repo = MockReviewRepository();
        vi.mocked(repo.findByMemberId).mockResolvedValue([
            { gameId: 10, id: 99, memberId: "m1" } as any,
        ]);

        const usecase = new CreateReviewUsecase(repo);
        await expect(
            usecase.execute("m1", {
                gameId: 10,
                content: "Duplicate",
                rating: 3,
            })
        ).rejects.toThrow("이미 이 게임에 대한 리뷰를 작성했습니다.");
    });
});
