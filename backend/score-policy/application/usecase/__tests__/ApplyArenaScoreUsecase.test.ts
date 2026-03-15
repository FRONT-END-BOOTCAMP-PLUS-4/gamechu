import { describe, it, expect, vi } from "vitest";
import { ApplyArenaScoreUsecase } from "../ApplyArenaScoreUsecase";
import { MockScoreRecordRepository } from "@/tests/mocks/MockScoreRecordRepository";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";

describe("ApplyArenaScoreUsecase", () => {
    function setup() {
        const scorePolicy = new ScorePolicy();
        const memberRepo = { incrementScore: vi.fn().mockResolvedValue(undefined) };
        const scoreRecordRepo = MockScoreRecordRepository();
        vi.mocked(scoreRecordRepo.createRecord).mockResolvedValue(undefined);
        const usecase = new ApplyArenaScoreUsecase(
            scorePolicy,
            memberRepo,
            scoreRecordRepo
        );
        return { usecase, memberRepo, scoreRecordRepo };
    }

    it("WIN: calls incrementScore with delta 190 and createRecord with policyId 5", async () => {
        const { usecase, memberRepo, scoreRecordRepo } = setup();
        await usecase.execute({ memberId: "m1", result: "WIN" });

        expect(memberRepo.incrementScore).toHaveBeenCalledWith("m1", 190);
        expect(scoreRecordRepo.createRecord).toHaveBeenCalledWith({
            memberId: "m1",
            policyId: 5,
            actualScore: 190,
        });
    });

    it("DRAW: calls incrementScore with delta 100 and createRecord with policyId 6", async () => {
        const { usecase, memberRepo, scoreRecordRepo } = setup();
        await usecase.execute({ memberId: "m1", result: "DRAW" });

        expect(memberRepo.incrementScore).toHaveBeenCalledWith("m1", 100);
        expect(scoreRecordRepo.createRecord).toHaveBeenCalledWith({
            memberId: "m1",
            policyId: 6,
            actualScore: 100,
        });
    });

    it("JOIN: calls incrementScore with delta -100 and createRecord with policyId 4", async () => {
        const { usecase, memberRepo, scoreRecordRepo } = setup();
        await usecase.execute({ memberId: "m1", result: "JOIN" });

        expect(memberRepo.incrementScore).toHaveBeenCalledWith("m1", -100);
        expect(scoreRecordRepo.createRecord).toHaveBeenCalledWith({
            memberId: "m1",
            policyId: 4,
            actualScore: -100,
        });
    });

    it("CANCEL: calls incrementScore with delta 100 and createRecord with policyId 7", async () => {
        const { usecase, memberRepo, scoreRecordRepo } = setup();
        await usecase.execute({ memberId: "m1", result: "CANCEL" });

        expect(memberRepo.incrementScore).toHaveBeenCalledWith("m1", 100);
        expect(scoreRecordRepo.createRecord).toHaveBeenCalledWith({
            memberId: "m1",
            policyId: 7,
            actualScore: 100,
        });
    });
});
