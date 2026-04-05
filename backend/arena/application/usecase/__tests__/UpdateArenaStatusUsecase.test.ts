import { describe, it, expect, vi } from "vitest";
import { UpdateArenaStatusUsecase } from "../UpdateArenaStatusUsecase";
import { createMockArenaRepository } from "@/tests/mocks/createMockArenaRepository";
import { Arena } from "@/prisma/generated";
import { ApplyArenaScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase";

function makeApplyArenaScoreMock() {
    return { execute: vi.fn().mockResolvedValue(undefined) };
}

describe("UpdateArenaStatusUsecase", () => {
    it("status 2 transition: updateChallengerAndStatus called and score applied for challenger", async () => {
        const arenaRepo = createMockArenaRepository();
        const applyScore = makeApplyArenaScoreMock();

        vi.mocked(arenaRepo.findById).mockResolvedValue({
            id: 1,
            creatorId: "creator-1",
            challengerId: null,
            status: 1,
        } as unknown as Arena);
        vi.mocked(arenaRepo.updateChallengerAndStatus).mockResolvedValue(
            undefined
        );

        const usecase = new UpdateArenaStatusUsecase(
            arenaRepo,
            applyScore as unknown as ApplyArenaScoreUsecase
        );
        await usecase.execute({
            arenaId: 1,
            status: 2,
            challengerId: "challenger-1",
        });

        expect(arenaRepo.updateChallengerAndStatus).toHaveBeenCalledWith(
            1,
            "challenger-1",
            2
        );
        expect(applyScore.execute).toHaveBeenCalledWith({
            memberId: "challenger-1",
            result: "JOIN",
        });
    });

    it("non-2 status: updateStatus called without score", async () => {
        const arenaRepo = createMockArenaRepository();
        const applyScore = makeApplyArenaScoreMock();

        vi.mocked(arenaRepo.findById).mockResolvedValue({
            id: 1,
            creatorId: "creator-1",
            challengerId: "challenger-1",
            status: 2,
        } as unknown as Arena);
        vi.mocked(arenaRepo.updateStatus).mockResolvedValue(undefined);

        const usecase = new UpdateArenaStatusUsecase(
            arenaRepo,
            applyScore as unknown as ApplyArenaScoreUsecase
        );
        await usecase.execute({ arenaId: 1, status: 3 });

        expect(arenaRepo.updateStatus).toHaveBeenCalledWith(1, 3);
        expect(applyScore.execute).not.toHaveBeenCalled();
    });

    it("arena not found throws error", async () => {
        const arenaRepo = createMockArenaRepository();
        const applyScore = makeApplyArenaScoreMock();

        vi.mocked(arenaRepo.findById).mockResolvedValue(null);

        const usecase = new UpdateArenaStatusUsecase(
            arenaRepo,
            applyScore as unknown as ApplyArenaScoreUsecase
        );
        await expect(
            usecase.execute({ arenaId: 999, status: 3 })
        ).rejects.toThrow("투기장이 존재하지 않습니다.");
    });
});
