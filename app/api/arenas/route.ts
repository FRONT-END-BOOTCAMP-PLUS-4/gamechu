import { GetArenaListUsecase } from "@/backend/arena/application/usecase/GetArenaListUsecase";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const repo = new PrismaArenaRepository();
    const usecase = new GetArenaListUsecase(repo);

    try {
        const arenaList = await usecase.execute();
        return NextResponse.json({ success: true, data: arenaList });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message || "서버 오류 발생" },
            { status: 500 }
        );
    }
}
