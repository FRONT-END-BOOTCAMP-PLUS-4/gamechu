import { describe, it, expect, vi } from "vitest";
import { CreateVoteUsecase } from "../CreateVoteUsecase";
import { createMockVoteRepository } from "@/tests/mocks/createMockVoteRepository";
import { createMockArenaRepository } from "@/tests/mocks/createMockArenaRepository";
import { Arena, Vote } from "@/prisma/generated";

const arena = {
    id: 1,
    creatorId: "creator-1",
    challengerId: "challenger-1",
    status: 4,
} as unknown as Arena;

const savedVote = {
    id: 10,
    arenaId: 1,
    memberId: "voter-1",
    votedTo: "creator-1",
} as unknown as Vote;

describe("CreateVoteUsecase", () => {
    it("happy path: valid vote is saved and returned", async () => {
        const voteRepo = createMockVoteRepository();
        const arenaRepo = createMockArenaRepository();

        vi.mocked(arenaRepo.findById).mockResolvedValue(arena);
        vi.mocked(voteRepo.findAll).mockResolvedValue([]);
        vi.mocked(voteRepo.save).mockResolvedValue(savedVote);

        const usecase = new CreateVoteUsecase(voteRepo, arenaRepo);
        const result = await usecase.execute({
            arenaId: 1,
            memberId: "voter-1",
            votedTo: "creator-1",
        });

        expect(voteRepo.save).toHaveBeenCalledWith({
            arenaId: 1,
            memberId: "voter-1",
            votedTo: "creator-1",
        });
        expect(result.id).toBe(10);
    });

    it("throws if arena not found", async () => {
        const voteRepo = createMockVoteRepository();
        const arenaRepo = createMockArenaRepository();
        vi.mocked(arenaRepo.findById).mockResolvedValue(null);

        const usecase = new CreateVoteUsecase(voteRepo, arenaRepo);
        await expect(
            usecase.execute({
                arenaId: 99,
                memberId: "voter-1",
                votedTo: "creator-1",
            })
        ).rejects.toThrow("해당 아레나가 존재하지 않습니다.");
    });

    it("throws if arena status is not 4", async () => {
        const voteRepo = createMockVoteRepository();
        const arenaRepo = createMockArenaRepository();
        vi.mocked(arenaRepo.findById).mockResolvedValue({
            ...arena,
            status: 3,
        });

        const usecase = new CreateVoteUsecase(voteRepo, arenaRepo);
        await expect(
            usecase.execute({
                arenaId: 1,
                memberId: "voter-1",
                votedTo: "creator-1",
            })
        ).rejects.toThrow("투표 가능한 상태가 아닙니다.");
    });

    it("throws if member is a participant (creator)", async () => {
        const voteRepo = createMockVoteRepository();
        const arenaRepo = createMockArenaRepository();
        vi.mocked(arenaRepo.findById).mockResolvedValue(arena);

        const usecase = new CreateVoteUsecase(voteRepo, arenaRepo);
        await expect(
            usecase.execute({
                arenaId: 1,
                memberId: "creator-1",
                votedTo: "challenger-1",
            })
        ).rejects.toThrow("참여자는 투표할 수 없습니다.");
    });

    it("throws if member already voted", async () => {
        const voteRepo = createMockVoteRepository();
        const arenaRepo = createMockArenaRepository();
        vi.mocked(arenaRepo.findById).mockResolvedValue(arena);
        vi.mocked(voteRepo.findAll).mockResolvedValue([savedVote]);

        const usecase = new CreateVoteUsecase(voteRepo, arenaRepo);
        await expect(
            usecase.execute({
                arenaId: 1,
                memberId: "voter-1",
                votedTo: "creator-1",
            })
        ).rejects.toThrow("이미 투표한 사용자입니다.");
    });
});
