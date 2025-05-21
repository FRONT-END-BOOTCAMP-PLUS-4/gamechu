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
    { params }: { params: { arenaId: string } }
) {
    const { status } = await req.json(); // status는 1 ~ 5 중 하나
    const arenaId = parseInt(params.arenaId);

    const repo = new PrismaArenaRepository();
    const usecase = new UpdateArenaStatusUsecase(repo);

    try {
        await usecase.execute(arenaId, status);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err },
            { status: 500 }
        );
    }
}
