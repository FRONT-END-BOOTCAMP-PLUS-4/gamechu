// app/api/filters/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/prisma/generated";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const [genres, themes, platforms] = await Promise.all([
            prisma.genre.findMany(),
            prisma.theme.findMany(),
            prisma.platform.findMany(),
        ]);

        return NextResponse.json({ genres, themes, platforms });
    } catch (error) {
        console.error("[GET /api/filters] Error:", error);
        return NextResponse.json(
            { message: "서버 오류 발생" },
            { status: 500 }
        );
    }
}
