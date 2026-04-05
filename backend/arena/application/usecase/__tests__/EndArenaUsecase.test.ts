import { describe, it, expect, vi } from "vitest";
import { EndArenaUsecase } from "../EndArenaUsecase";
import { createMockArenaRepository } from "@/tests/mocks/createMockArenaRepository";
import { createMockVoteRepository } from "@/tests/mocks/createMockVoteRepository";
import { Arena } from "@/prisma/generated";
import { ApplyArenaScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase";

function makeApplyArenaScoreMock() {
    return { execute: vi.fn().mockResolvedValue(undefined) };
}

const creatorId = "creator-1";
const challengerId = "challenger-1";

describe("EndArenaUsecase", () => {
    it("WIN case: applyArenaScoreUsecase called with winner's memberId and WIN result", async () => {
        const arenaRepo = createMockArenaRepository();
        const voteRepo = createMockVoteRepository();
        const applyScore = makeApplyArenaScoreMock();

        vi.mocked(arenaRepo.findById).mockResolvedValue({
            id: 1,
            creatorId,
            challengerId,
            status: 4,
        } as unknown as Arena);
        // creatorId gets more votes
        vi.mocked(voteRepo.count)
            .mockResolvedValueOnce(10) // leftVotes (creator)
            .mockResolvedValueOnce(5); // rightVotes (challenger)

        const usecase = new EndArenaUsecase(
            arenaRepo,
            applyScore as unknown as ApplyArenaScoreUsecase,
            voteRepo
        );
        await usecase.execute(1);

        expect(applyScore.execute).toHaveBeenCalledWith({
            memberId: creatorId,
            result: "WIN",
        });
    });

    it("DRAW case: applyArenaScoreUsecase called twice with DRAW", async () => {
        const arenaRepo = createMockArenaRepository();
        const voteRepo = createMockVoteRepository();
        const applyScore = makeApplyArenaScoreMock();

        vi.mocked(arenaRepo.findById).mockResolvedValue({
            id: 1,
            creatorId,
            challengerId,
            status: 4,
        } as unknown as Arena);
        vi.mocked(voteRepo.count)
            .mockResolvedValueOnce(5)
            .mockResolvedValueOnce(5);

        const usecase = new EndArenaUsecase(
            arenaRepo,
            applyScore as unknown as ApplyArenaScoreUsecase,
            voteRepo
        );
        await usecase.execute(1);

        expect(applyScore.execute).toHaveBeenCalledTimes(2);
        expect(applyScore.execute).toHaveBeenCalledWith(
            expect.objectContaining({ result: "DRAW" })
        );
    });

    it("CANCEL case (no challenger): applyArenaScoreUsecase called once with CANCEL", async () => {
        const arenaRepo = createMockArenaRepository();
        const voteRepo = createMockVoteRepository();
        const applyScore = makeApplyArenaScoreMock();

        vi.mocked(arenaRepo.findById).mockResolvedValue({
            id: 1,
            creatorId,
            challengerId: null,
            status: 1,
        } as unknown as Arena);
        vi.mocked(voteRepo.count).mockResolvedValue(0);

        const usecase = new EndArenaUsecase(
            arenaRepo,
            applyScore as unknown as ApplyArenaScoreUsecase,
            voteRepo
        );
        await usecase.execute(1);

        expect(applyScore.execute).toHaveBeenCalledTimes(1);
        expect(applyScore.execute).toHaveBeenCalledWith({
            memberId: creatorId,
            result: "CANCEL",
        });
    });
});
