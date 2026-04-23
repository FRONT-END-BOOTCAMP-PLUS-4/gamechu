import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { validate, IdSchema } from "@/utils/Validation";
import { errorResponse } from "@/utils/ApiResponse";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { UpdateArenaStatusUsecase } from "@/backend/arena/application/usecase/UpdateArenaStatusUsecase";
import { UpdateArenaDetailDto } from "@/backend/arena/application/usecase/dto/UpdateArenaDetailDto";
import { ApplyArenaScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { scheduleArenaTransitions } from "@/lib/ArenaTimerRecovery";
import { sendTierNotificationIfChanged } from "@/lib/TierNotification";
import { PrismaNotificationRecordRepository } from "@/backend/notification-record/infra/repositories/prisma/PrismaNotificationRecordRepository";
import { CreateNotificationRecordUsecase } from "@/backend/notification-record/application/usecase/CreateNotificationRecordUsecase";
import { CreateNotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/CreateNotificationRecordDto";
import logger from "@/lib/Logger";

type RequestParams = {
    params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, { params }: RequestParams) {
    const log = logger.child({
        route: "/api/member/arenas/[id]/join",
        method: "POST",
    });
    try {
        const memberId = await getAuthUserId();
        if (!memberId) return errorResponse("로그인이 필요합니다.", 401);

        const idValidated = validate(IdSchema, (await params).id);
        if (!idValidated.success) return idValidated.response;
        const arenaId = idValidated.data;

        const arenaRepo = new PrismaArenaRepository();
        const arena = await arenaRepo.findById(arenaId);
        if (!arena) return errorResponse("투기장이 존재하지 않습니다.", 404);
        if (arena.challengerId)
            return errorResponse("이미 다른 유저가 참가 중입니다.", 409);
        if (arena.creatorId === memberId)
            return errorResponse(
                "본인이 만든 투기장에는 참가할 수 없습니다.",
                403
            );

        const memberRepo = new PrismaMemberRepository();
        const member = await memberRepo.findById(memberId);
        if (!member || member.score < 100)
            return errorResponse(
                "투기장 참여를 위해서는 최소 100점이 필요합니다.",
                403
            );

        const scorePolicy = new ScorePolicy();
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

        // challengerId comes from session — not from the request body
        const beforeScore = member.score;
        await updateArenaStatusUsecase.execute(
            new UpdateArenaDetailDto(arenaId, 2, memberId)
        );

        // Schedule server-side timer for the joined arena
        const updatedArena = await arenaRepo.findById(arenaId);
        if (updatedArena) {
            scheduleArenaTransitions(updatedArena);
        }

        // Notifications are non-critical — failure must not break the join response
        try {
            const notificationRepo = new PrismaNotificationRecordRepository();
            const createNotification = new CreateNotificationRecordUsecase(notificationRepo);
            await createNotification.execute(
                new CreateNotificationRecordDto(
                    arena.creatorId,
                    3,
                    `${member.nickname}이(가) 투기장에 참여했습니다.`
                )
            );
            const updatedMember = await memberRepo.findById(memberId);
            if (updatedMember) {
                await sendTierNotificationIfChanged(memberId, beforeScore, updatedMember.score);
            }
        } catch (notificationErr) {
            log.warn({ err: notificationErr }, "참여 알림 생성 실패");
        }

        return NextResponse.json({ message: "참가 완료" }, { status: 200 });
    } catch (error: unknown) {
        log.error({ err: error }, "투기장 참가 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
