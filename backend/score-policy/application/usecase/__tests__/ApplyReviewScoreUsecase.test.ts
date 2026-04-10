import { describe, it, expect, vi } from "vitest";
import { ApplyReviewScoreUsecase } from "../ApplyReviewScoreUsecase";
import { createMockScoreRecordRepository } from "@/tests/mocks/createMockScoreRecordRepository";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";

describe("ApplyReviewScoreUsecase", () => {
    function setup() {
        const scorePolicy = new ScorePolicy();
        const memberRepo = {
            incrementScore: vi.fn().mockResolvedValue(undefined),
        };
        const scoreRecordRepo = createMockScoreRecordRepository();
        vi.mocked(scoreRecordRepo.createRecord).mockResolvedValue(undefined);
        const usecase = new ApplyReviewScoreUsecase(
            scorePolicy,
            memberRepo,
            scoreRecordRepo
        );
        return { usecase, memberRepo, scoreRecordRepo };
    }

    it("LIKE with currentLikeCount < 20: delta = 5, policyId = 3", async () => {
        const { usecase, memberRepo, scoreRecordRepo } = setup();
        await usecase.execute({
            memberId: "m1",
            action: "LIKE",
            currentLikeCount: 5,
        });

        expect(memberRepo.incrementScore).toHaveBeenCalledWith("m1", 5);
        expect(scoreRecordRepo.createRecord).toHaveBeenCalledWith({
            memberId: "m1",
            policyId: 3,
            actualScore: 5,
        });
    });

    it("LIKE with currentLikeCount >= 20: delta = 0", async () => {
        const { usecase, memberRepo } = setup();
        await usecase.execute({
            memberId: "m1",
            action: "LIKE",
            currentLikeCount: 20,
        });

        expect(memberRepo.incrementScore).toHaveBeenCalledWith("m1", 0);
    });

    it("UNLIKE: delta = -5, policyId = 8", async () => {
        const { usecase, memberRepo, scoreRecordRepo } = setup();
        await usecase.execute({
            memberId: "m1",
            action: "UNLIKE",
            currentLikeCount: 3,
        });

        expect(memberRepo.incrementScore).toHaveBeenCalledWith("m1", -5);
        expect(scoreRecordRepo.createRecord).toHaveBeenCalledWith({
            memberId: "m1",
            policyId: 8,
            actualScore: -5,
        });
    });

    it("DELETE with 10 likes: delta = -50 (min(10*5,100))", async () => {
        const { usecase, memberRepo, scoreRecordRepo } = setup();
        await usecase.execute({
            memberId: "m1",
            action: "DELETE",
            currentLikeCount: 10,
        });

        expect(memberRepo.incrementScore).toHaveBeenCalledWith("m1", -50);
        expect(scoreRecordRepo.createRecord).toHaveBeenCalledWith({
            memberId: "m1",
            policyId: 2,
            actualScore: -50,
        });
    });

    it("DELETE with 25 likes: delta = -100 (capped at 100)", async () => {
        const { usecase, memberRepo } = setup();
        await usecase.execute({
            memberId: "m1",
            action: "DELETE",
            currentLikeCount: 25,
        });

        expect(memberRepo.incrementScore).toHaveBeenCalledWith("m1", -100);
    });
});
