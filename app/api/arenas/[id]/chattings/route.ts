import { FindChattingUsecase } from "@/backend/chatting/application/usecase/FindChattingUsecase";
import { SendChattingUsecase } from "@/backend/chatting/application/usecase/SendChattingUsecase";
import { PrismaChattingRepository } from "@/backend/chatting/infra/repositories/prisma/PrismaChattingRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const memberId = await getAuthUserId(); // 🔐 로그인된 유저 ID 가져오기
    if (!memberId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const arenaId = Number((await context.params).id);
    const { content } = await req.json();
    const createdAt = new Date();

    console.log("memberId", memberId);
    console.log("arenaId", arenaId);
    console.log("content", content);
    console.log("createdAt", createdAt);

    const usecase = new SendChattingUsecase(new PrismaChattingRepository());
    const chatting = await usecase.execute({
        id: -1,
        arenaId,
        memberId,
        content,
        createdAt,
    });

    return NextResponse.json(chatting, { status: 201 });
}

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const arenaId = Number((await context.params).id);
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
