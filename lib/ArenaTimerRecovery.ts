import { ArenaFilter } from "@/backend/arena/domain/repositories/filters/ArenaFilter";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { DeleteArenaUsecase } from "@/backend/arena/application/usecase/DeleteArenaUsecase";
import { UpdateArenaStatusUsecase } from "@/backend/arena/application/usecase/UpdateArenaStatusUsecase";
import { UpdateArenaDetailDto } from "@/backend/arena/application/usecase/dto/UpdateArenaDetailDto";
import { EndArenaUsecase } from "@/backend/arena/application/usecase/EndArenaUsecase";
import { ApplyArenaScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import type { Arena } from "@/prisma/generated";
import type { ArenaStatus } from "@/types/arena-status";
import redis from "@/lib/Redis";
import { arenaDetailKey, ARENA_LIST_VERSION_KEY } from "@/lib/CacheKey";
import logger from "@/lib/Logger";

const log = logger.child({ module: "ArenaTimerRecovery" });

// Module-level timer registry — prevents duplicate setTimeout chains per arena.
const scheduledTimers = new Map<number, NodeJS.Timeout[]>();

export async function recoverPendingArenaTimers(): Promise<void> {
    const arenaRepo = new PrismaArenaRepository();

    // ArenaFilter accepts a single status — query each active status separately.
    // Use Number.MAX_SAFE_INTEGER so no active arenas are silently truncated.
    const pending = (
        await Promise.all(
            [1, 2, 3, 4].map((s) =>
                arenaRepo.findAll(
                    new ArenaFilter(
                        s,
                        null,
                        "startDate",
                        false,
                        0,
                        Number.MAX_SAFE_INTEGER
                    )
                )
            )
        )
    ).flat();

    log.info(
        { count: pending.length },
        "서버 재시작: 대기 중인 투기장 타이머 복구"
    );

    for (const arena of pending) {
        scheduleArenaTransitions(arena);
    }
}

export function scheduleArenaTransitions(arena: Arena): void {
    // Skip if timers are already registered for this arena (e.g. startup + join race).
    if (scheduledTimers.has(arena.id)) {
        log.info({ arenaId: arena.id }, "타이머 중복 스케줄 방지: 이미 등록됨");
        return;
    }

    const now = Date.now();
    const startMs = new Date(arena.startDate).getTime();
    // debateEndDate and voteEndDate are not stored in DB — compute from startDate.
    // Matches GetArenaDetailUsecase.ts: endChatting = startDate + 30min, endVote = endChatting + 24h.
    const debateEndMs = startMs + 30 * 60 * 1000;
    const voteEndMs = debateEndMs + 24 * 60 * 60 * 1000;

    const timers: NodeJS.Timeout[] = [];

    const schedule = (targetMs: number, newStatus: ArenaStatus | "delete") => {
        const delay = Math.max(0, targetMs - now); // fire immediately if past
        const t = setTimeout(() => {
            transitionArena(arena.id, newStatus).finally(() => {
                // Clean up registry after the last timer fires.
                scheduledTimers.delete(arena.id);
            });
        }, delay);
        timers.push(t);
    };

    if (arena.status === 2) schedule(startMs, 3); // 2→3 at startDate
    if (arena.status === 3) schedule(debateEndMs, 4); // 3→4 at startDate + 30 min
    if (arena.status === 4) schedule(voteEndMs, 5); // 4→5 at startDate + 30 min + 24 h
    if (arena.status === 1 && !arena.challengerId) {
        schedule(startMs, "delete"); // 1→delete at startDate if no challenger
    }

    if (timers.length > 0) {
        scheduledTimers.set(arena.id, timers);
    }
}

async function transitionArena(
    arenaId: number,
    newStatus: ArenaStatus | "delete"
): Promise<void> {
    try {
        const arenaRepo = new PrismaArenaRepository();
        const current = await arenaRepo.findById(arenaId);
        if (!current) return; // already deleted

        if (newStatus === "delete") {
            // Only delete if still recruiting with no challenger — a user may have joined
            // between server startup and startDate, which would have changed the status to 2.
            if (current.status !== 1 || current.challengerId) {
                log.info({ arenaId }, "delete 타이머 취소: 이미 참가자 있음");
                return;
            }
            await new DeleteArenaUsecase(arenaRepo).execute(arenaId);
        } else {
            const scorePolicy = new ScorePolicy();
            const memberRepo = new PrismaMemberRepository();
            const scoreRecordRepo = new PrismaScoreRecordRepository();
            const applyArenaScoreUsecase = new ApplyArenaScoreUsecase(
                scorePolicy,
                memberRepo,
                scoreRecordRepo
            );
            const updateArenaStatusUsecase = new UpdateArenaStatusUsecase(
                arenaRepo,
                applyArenaScoreUsecase
            );
            await updateArenaStatusUsecase.execute(
                new UpdateArenaDetailDto(arenaId, newStatus)
            );
            if (newStatus === 5) {
                const voteRepo = new PrismaVoteRepository();
                const endArenaUsecase = new EndArenaUsecase(
                    arenaRepo,
                    applyArenaScoreUsecase,
                    voteRepo
                );
                await endArenaUsecase.execute(arenaId);
            }
        }
        await redis.del(arenaDetailKey(arenaId));
        await redis.incr(ARENA_LIST_VERSION_KEY);
        log.info({ arenaId, newStatus }, "투기장 상태 전환 완료");
    } catch (error) {
        log.error({ arenaId, newStatus, err: error }, "투기장 상태 전환 실패");
    }
}
