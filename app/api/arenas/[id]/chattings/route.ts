// api/arenas/[id]/chattings/route.ts
import { FindChattingUsecase } from "@/backend/chatting/application/usecase/FindChattingUsecase";
import { SendChattingUsecase } from "@/backend/chatting/application/usecase/SendChattingUsecase";
import { PrismaChattingRepository } from "@/backend/chatting/infra/repositories/prisma/PrismaChattingRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { NextRequest, NextResponse } from "next/server";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";

// 상수 정의 (프론트엔드 훅, 유스케이스와 맞춰야 함)
const MAX_MESSAGE_LENGTH = 200;
const MAX_SEND_COUNT = 5;

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    // 🔐 로그인된 유저 ID 가져오기 (인증)
    const memberId = await getAuthUserId();
    if (!memberId) {
        console.warn("POST /chattings: Unauthorized access attempt");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const arenaId = Number((await context.params).id);
    if (isNaN(arenaId)) {
        console.warn(
            `POST /chattings(${
                (await context.params).id
            }): Invalid arenaId provided for member ${memberId}`
        );
        return NextResponse.json({ error: "Invalid arenaId" }, { status: 400 });
    }

    const { content } = await req.json();
    if (
        !content ||
        typeof content !== "string" ||
        content.trim().length === 0
    ) {
        console.warn(
            `POST /chattings(${arenaId}): Empty or invalid content received from member ${memberId}`
        );
        return NextResponse.json(
            { error: "메시지 내용을 입력해주세요." },
            { status: 400 }
        );
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
        console.warn(
            `POST /chattings(${arenaId}): Message exceeds max length (${MAX_MESSAGE_LENGTH}) from member ${memberId}`
        );
        return NextResponse.json(
            {
                error: `메시지 길이는 ${MAX_MESSAGE_LENGTH}자를 초과할 수 없습니다.`,
            },
            { status: 400 }
        );
    }
    // -- 아레나 정보 불러오기 및 유효성 검사 --
    try {
        const chattingRepository = new PrismaChattingRepository();
        const arenaRepository = new PrismaArenaRepository();
        const sendChattingUsecase = new SendChattingUsecase(
            chattingRepository,
            arenaRepository
        );
        const { newChat, remainingSends } = await sendChattingUsecase.execute({
            arenaId,
            memberId,
            content,
        });

        // -- 응답 데이터에 새로 저장된 채팅 객체와 남은 횟수 정보 포함 --
        return NextResponse.json(
            {
                newChat,
                remainingSends,
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error(
            `💥 Error processing chat POST for arena ${arenaId} by member ${memberId}:`,
            error
        );
        if (typeof error === "object" && error !== null && "message" in error) {
            const message = String((error as { message?: string }).message);
            if (
                message.includes("메시지 길이가 너무 깁니다") ||
                message.includes("length limit")
            ) {
                return NextResponse.json(
                    {
                        error: `메시지 길이는 ${MAX_MESSAGE_LENGTH}자를 초과할 수 없습니다.`,
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
                        error: `메시지 전송 횟수(${MAX_SEND_COUNT}번)를 모두 사용했습니다.`,
                    },
                    { status: 400 }
                );
            }
            if (
                message.includes("참가자가 아닙니다") ||
                message.includes("Not a participant")
            ) {
                return NextResponse.json(
                    { error: "아레나 참가자만 메시지를 보낼 수 있습니다." },
                    { status: 403 }
                );
            }
            if (
                message.includes(
                    "지금은 메시지를 보낼 수 없는 아레나 상태입니다"
                ) ||
                message.includes("Invalid arena status")
            ) {
                return NextResponse.json({ error: message }, { status: 400 });
            }
        }
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const arenaId = Number((await context.params).id);
    if (isNaN(arenaId)) {
        console.warn(
            `GET /chattings: Invalid arenaId: ${(await context.params).id}`
        );
        return NextResponse.json({ error: "Invalid arenaId" }, { status: 400 });
    }

    const memberId = await getAuthUserId();
    const prismaChattingRepository = new PrismaChattingRepository();
    const findChattingUsecase = new FindChattingUsecase(
        prismaChattingRepository
    );

    try {
        // 여기서 memberId도 같이 넘겨줍니다 (null도 가능)
        const result = await findChattingUsecase.execute({ arenaId, memberId });
        return NextResponse.json(result);
    } catch (error) {
        console.error(
            `💥 Error processing chat GET for arena ${arenaId}:`,
            error
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
