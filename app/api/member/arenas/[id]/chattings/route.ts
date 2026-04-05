import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { CreateChattingUsecase } from "@/backend/chatting/application/usecase/CreateChattingUsecase";
import { CreateChattingDto } from "@/backend/chatting/application/usecase/dto/CreateChattingDto";
import { CreateChattingSchema } from "@/backend/chatting/application/usecase/dto/CreateChattingDto";
import { PrismaChattingRepository } from "@/backend/chatting/infra/repositories/prisma/PrismaChattingRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { IdSchema, validate } from "@/utils/Validation";
import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";

// 상수 정의 (프론트엔드 훅, 유스케이스와 맞춰야 함)
const MAX_SEND_COUNT = 5;

type RequestParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function POST(req: NextRequest, { params }: RequestParams) {
    const { id } = await params;
    const memberId = await getAuthUserId();
    const log = logger.child({ route: "/api/member/arenas/[id]/chattings", method: "POST" });

    if (!memberId) {
        return errorResponse("권한이 없습니다.", 401);
    }

    const idValidation = validate(IdSchema, id);
    if (!idValidation.success) return idValidation.response;
    const arenaId = idValidation.data;

    const body = await req.json();
    const bodyValidation = validate(CreateChattingSchema, body);
    if (!bodyValidation.success) {
        return bodyValidation.response;
    }

    const { content } = bodyValidation.data;

    // -- 아레나 정보 불러오기 및 유효성 검사 --
    try {
        const chattingRepository = new PrismaChattingRepository();
        const arenaRepository = new PrismaArenaRepository();
        const createChattingUsecase = new CreateChattingUsecase(
            chattingRepository,
            arenaRepository
        );
        const createChattingDto = new CreateChattingDto(
            arenaId,
            memberId,
            content
        );
        const result = await createChattingUsecase.execute(createChattingDto);

        // -- 응답 데이터에 새로 저장된 채팅 객체와 남은 횟수 정보 포함 --
        return NextResponse.json(
            {
                newChat: result,
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        log.error({ userId: memberId, arenaId, err: error }, "채팅 메시지 전송 실패");
        if (typeof error === "object" && error !== null && "message" in error) {
            const message = String((error as { message?: string }).message);
            if (
                message.includes("메시지 길이가 너무 깁니다") ||
                message.includes("length limit")
            ) {
                return NextResponse.json(
                    {
                        message: `메시지 길이는 200자를 초과할 수 없습니다.`,
                    },
                    { status: 400 }
                );
            }
            if (
                message.includes("메시지 전송 횟수를 초과했습니다") ||
                message.includes("send count limit")
            ) {
                return NextResponse.json(
                    {
                        message: `메시지 전송 횟수(${MAX_SEND_COUNT}번)를 모두 사용했습니다.`,
                    },
                    { status: 400 }
                );
            }
            if (
                message.includes("참가자가 아닙니다") ||
                message.includes("Not a participant")
            ) {
                return NextResponse.json(
                    { message: "아레나 참가자만 메시지를 보낼 수 있습니다." },
                    { status: 403 }
                );
            }
            if (
                message.includes(
                    "지금은 메시지를 보낼 수 없는 아레나 상태입니다"
                ) ||
                message.includes("Invalid arena status")
            ) {
                return NextResponse.json({ message }, { status: 400 });
            }
        }
        return errorResponse("알 수 없는 오류가 발생했습니다.", 500);
    }
}
