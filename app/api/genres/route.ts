// app/api/genres/route.ts
import { NextResponse } from "next/server";
import { PrismaGenreRepository } from "@/backend/genre/infra/repositories/prisma/PrismaGenreRepository";
import { GetAllGenresUsecase } from "@/backend/genre/application/usecase/GetAllGenresUsecase";

export async function GET() {
    try {
        const repo = new PrismaGenreRepository();
        const usecase = new GetAllGenresUsecase(repo);
        const genres = await usecase.execute();

        return NextResponse.json(genres);
    } catch (e) {
        console.error("[GET /genres] 장르 조회 실패:", e);
        return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
}
