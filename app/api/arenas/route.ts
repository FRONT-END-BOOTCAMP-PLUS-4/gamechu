import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        // get query parameters from URL
        const url = new URL(request.url);
        const status = url.searchParams.get("status") || null;

        // set up repositories and usecases
        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
    } catch (error) {
        console.error(`Error fetching arenas: ${error}`);
        return NextResponse.json(
            { error: "Failed to fetch arenas" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const memberId = await getAuthUserId();

        if (!memberId) {
            return NextResponse.json(
                { error: "투기장 작성 권한이 없습니다." },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error(`Error fetching arenas: ${error}`);
        return NextResponse.json(
            { error: "Failed to fetch arenas" },
            { status: 500 }
        );
    }
}
