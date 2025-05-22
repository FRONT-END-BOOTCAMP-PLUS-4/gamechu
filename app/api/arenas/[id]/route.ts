import { GetArenaDetailUsecase } from "@/backend/arena/application/usecase/GetArenaDetailUsecase";
import { UpdateArenaStatusUsecase } from "@/backend/arena/application/usecase/UpdateArenaStatusUsecase";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const arenaId = Number((await context.params).id);

    if (isNaN(arenaId)) {
        return NextResponse.json({ error: "Invalid arenaId" }, { status: 400 });
    }

    const usecase = new GetArenaDetailUsecase(new PrismaArenaRepository());

    try {
        const result = await usecase.execute(arenaId);
        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json(
            { error: "Failed to fetch participants" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { status, challengerId } = await req.json();
    const arenaId = Number((await context.params).id);

    const repo = new PrismaArenaRepository();
    const usecase = new UpdateArenaStatusUsecase(repo);
    console.log("떠야됨: ", challengerId);
    try {
        await usecase.execute(arenaId, status, challengerId); // challengerId 없으면 undefined
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "에러 발생" },
            { status: 500 }
        );
    }
}
