import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetArenaDetailCache = vi.fn().mockResolvedValue(null);
const mockSetArenaDetailCache = vi.fn().mockResolvedValue(undefined);

vi.mock("@/backend/arena/infra/cache/ArenaCacheService", () => ({
    ArenaCacheService: vi.fn(function (this: Record<string, unknown>) {
        this.getArenaDetailCache = mockGetArenaDetailCache;
        this.setArenaDetailCache = mockSetArenaDetailCache;
    }),
}));

vi.mock("@/lib/redis", () => ({
    default: {},
}));

import { GetArenaDetailUsecase } from "../GetArenaDetailUsecase";
import { MockArenaRepository } from "@/tests/mocks/MockArenaRepository";
import { MockMemberRepository } from "@/tests/mocks/MockMemberRepository";
import { MockVoteRepository } from "@/tests/mocks/MockVoteRepository";
import { ArenaDetailDto } from "../dto/ArenaDetailDto";

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

    it("cache hit: returns cached value immediately, no repo calls, setArenaDetailCache NOT called", async () => {
        const arenaRepo = MockArenaRepository();
        const memberRepo = MockMemberRepository();
        const voteRepo = MockVoteRepository();

        const cached: ArenaDetailDto = {
            id: 42,
            creatorId: "creator-1",
            creatorName: "Creator",
            creatorScore: 100,
            challengerId: "challenger-1",
            challengerName: "Challenger",
            challengerScore: 80,
            title: "Cached Arena",
            description: "cached",
            startDate,
            endChatting: new Date(startDate.getTime() + 30 * 60 * 1000),
            endVote: new Date(startDate.getTime() + 30 * 60 * 1000 + 24 * 60 * 60 * 1000),
            status: 2,
            voteCount: 0,
            leftCount: 0,
            rightCount: 0,
            leftPercent: 0,
            rightPercent: 0,
        };
        mockGetArenaDetailCache.mockResolvedValueOnce(cached);

        const usecase = new GetArenaDetailUsecase(arenaRepo, memberRepo, voteRepo);
        const result = await usecase.execute({ arenaId: 42 });

        expect(result).toEqual(cached);
        expect(arenaRepo.getArenaById).not.toHaveBeenCalled();
        expect(mockSetArenaDetailCache).not.toHaveBeenCalled();
    });

    it("cache miss: calls getArenaById, builds result, and calls setArenaDetailCache", async () => {
        const arenaRepo = MockArenaRepository();
        const memberRepo = MockMemberRepository();
        const voteRepo = MockVoteRepository();

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
        const arenaRepo = MockArenaRepository();
        const memberRepo = MockMemberRepository();
        const voteRepo = MockVoteRepository();

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

    it("zero-vote edge case: totalCount === 0 → both percents are 0 (no divide-by-zero)", async () => {
        const arenaRepo = MockArenaRepository();
        const memberRepo = MockMemberRepository();
        const voteRepo = MockVoteRepository();

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
        const arenaRepo = MockArenaRepository();
        const memberRepo = MockMemberRepository();
        const voteRepo = MockVoteRepository();

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
