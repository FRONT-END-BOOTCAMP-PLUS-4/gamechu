// app/api/arenas/[arenaId]/participants/route.ts (App Router 기준)
import { GetArenaParticipantsUsecase } from "@/backend/arena/application/usecase/GetArenaParticipantsUsecase";
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

    const usecase = new GetArenaParticipantsUsecase(
        new PrismaArenaRepository()
    );

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
