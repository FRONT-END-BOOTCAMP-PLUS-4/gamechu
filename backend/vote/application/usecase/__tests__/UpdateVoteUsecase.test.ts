import { describe, it, expect, vi } from "vitest";
import { UpdateVoteUsecase } from "../UpdateVoteUsecase";
import { MockVoteRepository } from "@/tests/mocks/MockVoteRepository";
import { Vote } from "@/prisma/generated";

describe("UpdateVoteUsecase", () => {
    it("updates votedTo on existing vote", async () => {
        const voteRepo = MockVoteRepository();
        const existingVote = {
            id: 10,
            arenaId: 1,
            memberId: "voter-1",
            votedTo: "creator-1",
        } as unknown as Vote;
        const updatedVote = { ...existingVote, votedTo: "challenger-1" } as unknown as Vote;

        vi.mocked(voteRepo.findAll).mockResolvedValue([existingVote]);
        vi.mocked(voteRepo.update).mockResolvedValue(updatedVote);

        const usecase = new UpdateVoteUsecase(voteRepo);
        const result = await usecase.execute({
            arenaId: 1,
            memberId: "voter-1",
            votedTo: "challenger-1",
        });

        expect(voteRepo.update).toHaveBeenCalledWith(
            expect.objectContaining({ votedTo: "challenger-1" })
        );
        expect(result.votedTo).toBe("challenger-1");
    });

    it("throws if no existing vote", async () => {
        const voteRepo = MockVoteRepository();
        vi.mocked(voteRepo.findAll).mockResolvedValue([]);

        const usecase = new UpdateVoteUsecase(voteRepo);
        await expect(
            usecase.execute({ arenaId: 1, memberId: "voter-1", votedTo: "challenger-1" })
        ).rejects.toThrow("투표 내역이 없습니다.");
    });
});
