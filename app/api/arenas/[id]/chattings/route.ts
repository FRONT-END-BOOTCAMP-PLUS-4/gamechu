import { GetChattingUsecase } from "@/backend/chatting/application/usecase/GetChattingUsecase";
import { PrismaChattingRepository } from "@/backend/chatting/infra/repositories/prisma/PrismaChattingRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const arenaId = Number((await context.params).id);
    const memberId = await getAuthUserId();
    if (isNaN(arenaId)) {
        return NextResponse.json(
            { error: "유효하지 않은 투기장 ID입니다." },
            { status: 400 }
        );
    }

    try {
        const chattingRepository = new PrismaChattingRepository();
        const getChattingUsecase = new GetChattingUsecase(chattingRepository);
        const result = await getChattingUsecase.execute({ arenaId, memberId });

        return NextResponse.json(result);
    } catch (error) {
        console.error("채팅 조회 중 오류 발생:", error);
        return NextResponse.json(
            { error: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
