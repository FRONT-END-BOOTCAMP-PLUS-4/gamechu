import { describe, it, expect, vi } from "vitest";
import { UpdateReviewUsecase } from "../UpdateReviewUsecase";
import { MockReviewRepository } from "@/tests/mocks/MockReviewRepository";

describe("UpdateReviewUsecase", () => {
    it("delegates to repository.update with correct args", async () => {
        const repo = MockReviewRepository();
        const updatedDto = {
            id: 1,
            content: "Updated content",
            rating: 4,
        } as any;
        vi.mocked(repo.update).mockResolvedValue(updatedDto);

        const usecase = new UpdateReviewUsecase(repo);
        const result = await usecase.execute(1, {
            content: "Updated content",
            rating: 4,
        });

        expect(repo.update).toHaveBeenCalledWith(1, {
            content: "Updated content",
            rating: 4,
        });
        expect(result.content).toBe("Updated content");
    });
});
