import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/redis", () => ({
    default: {},
}));

import { GetArenaDetailUsecase } from "../GetArenaDetailUsecase";
import { createMockArenaRepository } from "@/tests/mocks/createMockArenaRepository";
import { createMockMemberRepository } from "@/tests/mocks/createMockMemberRepository";
import { createMockVoteRepository } from "@/tests/mocks/createMockVoteRepository";

const startDate = new Date("2026-04-01T10:00:00.000Z");
const mockArenaWithRelations = {
    id: 42,
    creatorId: "creator-1",
    challengerId: "challenger-1",
    title: "Test Arena",
    description: "A test arena",
    startDate,
    status: 2,
    creator: { id: "creator-1", nickname: "Creator", imageUrl: null, score: 100 },
    challenger: { id: "challenger-1", nickname: "Challenger", imageUrl: null, score: 80 },
};

describe("GetArenaDetailUsecase", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("executes business logic: calls getArenaById and builds ArenaDetailDto", async () => {
        const arenaRepo = createMockArenaRepository();
        const memberRepo = createMockMemberRepository();
        const voteRepo = createMockVoteRepository();

        vi.mocked(arenaRepo.getArenaById).mockResolvedValue(
            mockArenaWithRelations as never
        );
        vi.mocked(voteRepo.countByArenaIds).mockResolvedValue([
            { arenaId: 42, totalCount: 10, leftCount: 7, rightCount: 3 },
        ]);

        const usecase = new GetArenaDetailUsecase(arenaRepo, memberRepo, voteRepo);
        const result = await usecase.execute({ arenaId: 42 });

        expect(arenaRepo.getArenaById).toHaveBeenCalledWith(42);
        expect(result.id).toBe(42);
        expect(result.title).toBe("Test Arena");
    });

    it("vote percentage: totalCount > 0 computes leftPercent and rightPercent correctly", async () => {
        const arenaRepo = createMockArenaRepository();
        const memberRepo = createMockMemberRepository();
        const voteRepo = createMockVoteRepository();

        vi.mocked(arenaRepo.getArenaById).mockResolvedValue(
            mockArenaWithRelations as never
        );
        vi.mocked(voteRepo.countByArenaIds).mockResolvedValue([
            { arenaId: 42, totalCount: 10, leftCount: 3, rightCount: 7 },
        ]);

        const usecase = new GetArenaDetailUsecase(arenaRepo, memberRepo, voteRepo);
        const result = await usecase.execute({ arenaId: 42 });

        expect(result.leftPercent).toBe(30);
        expect(result.rightPercent).toBe(70);
    });

    it("zero-vote edge case: totalCount === 0 → both percents are 0", async () => {
        const arenaRepo = createMockArenaRepository();
        const memberRepo = createMockMemberRepository();
        const voteRepo = createMockVoteRepository();

        vi.mocked(arenaRepo.getArenaById).mockResolvedValue(
            mockArenaWithRelations as never
        );
        vi.mocked(voteRepo.countByArenaIds).mockResolvedValue([
            { arenaId: 42, totalCount: 0, leftCount: 0, rightCount: 0 },
        ]);

        const usecase = new GetArenaDetailUsecase(arenaRepo, memberRepo, voteRepo);
        const result = await usecase.execute({ arenaId: 42 });

        expect(result.leftPercent).toBe(0);
        expect(result.rightPercent).toBe(0);
    });

    it("time calculations: endChatting = startDate + 30min, endVote = endChatting + 24h", async () => {
        const arenaRepo = createMockArenaRepository();
        const memberRepo = createMockMemberRepository();
        const voteRepo = createMockVoteRepository();

        vi.mocked(arenaRepo.getArenaById).mockResolvedValue(
            mockArenaWithRelations as never
        );
        vi.mocked(voteRepo.countByArenaIds).mockResolvedValue([
            { arenaId: 42, totalCount: 0, leftCount: 0, rightCount: 0 },
        ]);

        const usecase = new GetArenaDetailUsecase(arenaRepo, memberRepo, voteRepo);
        const result = await usecase.execute({ arenaId: 42 });

        const expectedEndChatting = new Date(startDate.getTime() + 30 * 60 * 1000);
        const expectedEndVote = new Date(expectedEndChatting.getTime() + 24 * 60 * 60 * 1000);

        expect(result.endChatting.getTime()).toBe(expectedEndChatting.getTime());
        expect(result.endVote.getTime()).toBe(expectedEndVote.getTime());
    });
});
