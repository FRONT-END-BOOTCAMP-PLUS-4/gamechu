import { FindChattingUsecase } from "@/backend/chatting/application/usecase/FindChattingUsecase";
import { SendChattingUsecase } from "@/backend/chatting/application/usecase/SendChattingUsecase";
import { PrismaChattingRepository } from "@/backend/chatting/infra/repositories/prisma/PrismaChattingRepository";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    context: { params: { id: string } }
) {
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user?.id) {
    //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    // const memberId = session.user.id;
    const id = -1;
    const memberId = "7ae5e5c9-0c28-426f-952f-85bdfdcfc522";
    const arenaId = Number(context.params.id);
    const { content } = await req.json();
    const createdAt = new Date();

    console.log("memberId", memberId);
    console.log("arenaId", arenaId);
    console.log("content", content);
    console.log("createdAt", createdAt);
    // ✅ 권한 체크: 해당 Arena의 creator 또는 challenger인지 확인
    // const arena = await prisma.arena.findUnique({
    //     where: { id: arenaId },
    //     select: { creator_id: true, challenger_id: true },
    // });

    // if (
    //     !arena ||
    //     (arena.creator_id !== memberId && arena.challenger_id !== memberId)
    // ) {
    //     return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    // }
    const usecase = new SendChattingUsecase(new PrismaChattingRepository());
    const chatting = await usecase.execute({
        id,
        arenaId,
        memberId,
        content,
        createdAt,
    });

    return NextResponse.json(chatting, { status: 201 });
}

export async function GET(req: Request, context: { params: { id: string } }) {
    const arenaId = Number(context.params.id);
    if (isNaN(arenaId)) {
        return NextResponse.json({ error: "Invalid arenaId" }, { status: 400 });
    }

    const repository = new PrismaChattingRepository();
    const usecase = new FindChattingUsecase(repository);

    try {
        const chatList = await usecase.execute(arenaId);
        return NextResponse.json(chatList);
    } catch (error) {
        console.error("💥 Error getting arena chat list:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
