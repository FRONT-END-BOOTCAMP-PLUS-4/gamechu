// api/arenas/[id]/chattings/route.ts
import { GetChattingUsecase } from "@/backend/chatting/application/usecase/GetChattingUsecase";
import { PrismaChattingRepository } from "@/backend/chatting/infra/repositories/prisma/PrismaChattingRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { NextResponse } from "next/server";

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
    const getChattingUsecase = new GetChattingUsecase(prismaChattingRepository);

    try {
        // 여기서 memberId도 같이 넘겨줍니다 (null도 가능)
        const result = await getChattingUsecase.execute({ arenaId, memberId });
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
