import { describe, it, expect, vi } from "vitest";
import { ApplyAttendanceScoreUsecase } from "../ApplyAttendanceScoreUsecase";
import { createMockScoreRecordRepository } from "@/tests/mocks/createMockScoreRecordRepository";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";

describe("ApplyAttendanceScoreUsecase", () => {
    function setup() {
        const scorePolicy = new ScorePolicy();
        const memberRepo = {
            incrementScore: vi.fn().mockResolvedValue(undefined),
            getLastAttendedDate: vi.fn(),
            updateLastAttendedDate: vi.fn().mockResolvedValue(undefined),
        };
        const scoreRecordRepo = createMockScoreRecordRepository();
        vi.mocked(scoreRecordRepo.createRecord).mockResolvedValue(undefined);
        const usecase = new ApplyAttendanceScoreUsecase(
            scorePolicy,
            memberRepo,
            scoreRecordRepo
        );
        return { usecase, memberRepo, scoreRecordRepo };
    }

    it("new day attendance: incrementScore with 5, updates date, creates record", async () => {
        const { usecase, memberRepo, scoreRecordRepo } = setup();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        await usecase.execute({
            memberId: "m1",
            lastAttendedDate: yesterday,
        });

        expect(memberRepo.incrementScore).toHaveBeenCalledWith("m1", 5);
        expect(memberRepo.updateLastAttendedDate).toHaveBeenCalledOnce();
        expect(scoreRecordRepo.createRecord).toHaveBeenCalledWith(
            expect.objectContaining({ memberId: "m1", policyId: 1, actualScore: 5 })
        );
    });

    it("same day attendance: nothing happens", async () => {
        const { usecase, memberRepo, scoreRecordRepo } = setup();
        const today = new Date();

        await usecase.execute({
            memberId: "m1",
            lastAttendedDate: today,
        });

        expect(memberRepo.incrementScore).not.toHaveBeenCalled();
        expect(scoreRecordRepo.createRecord).not.toHaveBeenCalled();
    });

    it("null lastAttendedDate (first attendance): score applied", async () => {
        const { usecase, memberRepo } = setup();

        await usecase.execute({
            memberId: "m1",
            lastAttendedDate: null,
        });

        expect(memberRepo.incrementScore).toHaveBeenCalledWith("m1", 5);
    });
});
