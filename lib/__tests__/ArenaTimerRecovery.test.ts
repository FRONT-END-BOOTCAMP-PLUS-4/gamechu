import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// --- mock stubs declared before any import ---
const mockFindById = vi.fn();
const mockUpdateExecute = vi.fn().mockResolvedValue(undefined);
const mockEndExecute = vi.fn().mockResolvedValue(undefined);
const mockDeleteExecute = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/Redis", () => ({
    default: {
        del: vi.fn().mockResolvedValue(undefined),
        incr: vi.fn().mockResolvedValue(undefined),
    },
}));

vi.mock("@/lib/Logger", () => ({
    default: {
        child: () => ({ info: vi.fn(), error: vi.fn(), warn: vi.fn() }),
    },
}));

vi.mock("@/lib/CacheKey", () => ({
    arenaDetailKey: (id: number) => `arena:detail:${id}`,
    ARENA_LIST_VERSION_KEY: "arena:list:version",
}));

vi.mock(
    "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository",
    () => ({
        PrismaArenaRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findById = mockFindById;
            this.findAll = vi.fn().mockResolvedValue([]);
            this.update = vi.fn().mockResolvedValue(undefined);
        }),
    })
);

vi.mock("@/backend/arena/application/usecase/UpdateArenaStatusUsecase", () => ({
    UpdateArenaStatusUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = mockUpdateExecute;
    }),
}));

vi.mock("@/backend/arena/application/usecase/DeleteArenaUsecase", () => ({
    DeleteArenaUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = mockDeleteExecute;
    }),
}));

vi.mock("@/backend/arena/application/usecase/EndArenaUsecase", () => ({
    EndArenaUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = mockEndExecute;
    }),
}));

vi.mock(
    "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase",
    () => ({
        ApplyArenaScoreUsecase: vi.fn(function (this: Record<string, unknown>) {
            this.execute = vi.fn();
        }),
    })
);

vi.mock("@/backend/score-policy/domain/ScorePolicy", () => ({
    ScorePolicy: vi.fn(function () {}),
}));

vi.mock(
    "@/backend/member/infra/repositories/prisma/PrismaMemberRepository",
    () => ({
        PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findById = vi.fn();
        }),
    })
);

vi.mock(
    "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository",
    () => ({
        PrismaScoreRecordRepository: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.create = vi.fn();
        }),
    })
);

vi.mock(
    "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository",
    () => ({
        PrismaVoteRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findByArenaId = vi.fn().mockResolvedValue([]);
        }),
    })
);

vi.mock(
    "@/backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository",
    () => ({
        PrismaNotificationRecordRepository: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.save = vi.fn().mockResolvedValue(undefined);
            this.count = vi.fn().mockResolvedValue(0);
        }),
    })
);

vi.mock(
    "@/backend/notification-record/application/usecase/CreateNotificationRecordUsecase",
    () => ({
        CreateNotificationRecordUsecase: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockResolvedValue(undefined);
        }),
    })
);

vi.mock("@/lib/TierNotification", () => ({
    sendTierNotificationIfChanged: vi.fn().mockResolvedValue(undefined),
}));

import { scheduleArenaTransitions } from "../ArenaTimerRecovery";

// Each test uses a unique arenaId to avoid scheduledTimers Map interference
// (the Map is module-level state that persists within a test run).
let nextArenaId = 9000;
function uniqueId() {
    return nextArenaId++;
}

function arena(id: number, status: number, startDate: Date) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { id, status, startDate, creatorId: "c", challengerId: "ch" } as any;
}

describe("ArenaTimerRecovery — timer chain (PR #299 regression)", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // --- core regression: PR #299 blocking issue ---

    it("after 2→3 fires, 3→4 timer is auto-registered without server restart", async () => {
        const id = uniqueId();
        const startDate = new Date(Date.now() + 200);

        const a2 = arena(id, 2, startDate);
        const a3 = arena(id, 3, startDate);

        // transitionArena calls findById twice:
        //   1st: current status guard ("already deleted?" check)
        //   2nd: chain call to get updated arena for next scheduleArenaTransitions
        mockFindById
            .mockResolvedValueOnce(a2) // current check during 2→3
            .mockResolvedValueOnce(a3) // chain → scheduleArenaTransitions(status 3)
            .mockResolvedValueOnce(a3) // current check during 3→4
            .mockResolvedValueOnce(null); // chain after 3→4 → null stops chain

        scheduleArenaTransitions(a2);

        // Fire 2→3
        await vi.advanceTimersByTimeAsync(300);
        expect(mockUpdateExecute).toHaveBeenCalledTimes(1);

        // Advance 30 min — the chained 3→4 timer must fire automatically
        await vi.advanceTimersByTimeAsync(30 * 60 * 1000);
        expect(mockUpdateExecute).toHaveBeenCalledTimes(2);
    });

    it("full chain 2→3→4→5 completes without server restart", async () => {
        const id = uniqueId();
        // startDate far in the past → all delays are 0 (fire immediately)
        const past = new Date(
            Date.now() - (30 * 60 + 24 * 60 * 60) * 1000 - 5000
        );

        const base = arena(id, 2, past);

        mockFindById
            .mockResolvedValueOnce({ ...base, status: 2 }) // current check (2→3)
            .mockResolvedValueOnce({ ...base, status: 3 }) // chain → schedule 3→4
            .mockResolvedValueOnce({ ...base, status: 3 }) // current check (3→4)
            .mockResolvedValueOnce({ ...base, status: 4 }) // chain → schedule 4→5
            .mockResolvedValueOnce({ ...base, status: 4 }) // current check (4→5)
            .mockResolvedValueOnce({ ...base, status: 5 }); // chain → status 5 → no timer

        scheduleArenaTransitions(base);

        await vi.runAllTimersAsync();

        expect(mockUpdateExecute).toHaveBeenCalledTimes(3); // 2→3, 3→4, 4→5
        expect(mockEndExecute).toHaveBeenCalledTimes(1); // EndArenaUsecase for status 5
    });

    it("status 5 (terminal) registers no further timers", async () => {
        const id = uniqueId();
        const past = new Date(Date.now() - 1000);

        scheduleArenaTransitions(arena(id, 5, past));

        await vi.runAllTimersAsync();

        expect(mockUpdateExecute).not.toHaveBeenCalled();
        expect(mockFindById).not.toHaveBeenCalled();
    });

    it("deleted arena: null from findById halts chain without error", async () => {
        const id = uniqueId();
        const past = new Date(Date.now() - 1000);

        // transitionArena returns early when current is null
        mockFindById.mockResolvedValueOnce(null);

        scheduleArenaTransitions(arena(id, 2, past));

        await vi.runAllTimersAsync();

        expect(mockUpdateExecute).not.toHaveBeenCalled();
    });

    it("dedup guard: second scheduleArenaTransitions call for same arena is a no-op", async () => {
        const id = uniqueId();
        const past = new Date(Date.now() - 1000);

        const a2 = arena(id, 2, past);

        mockFindById.mockResolvedValueOnce(a2).mockResolvedValueOnce(null);

        scheduleArenaTransitions(a2);
        // Second call hits the scheduledTimers.has() guard and returns early
        scheduleArenaTransitions(a2);

        await vi.runAllTimersAsync();

        // 2→3 should fire exactly once, not twice
        expect(mockUpdateExecute).toHaveBeenCalledTimes(1);
    });
});
