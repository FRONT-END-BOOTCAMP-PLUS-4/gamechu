import { NextResponse } from "next/server";
import { PrismaGenreRepository } from "@/backend/genre/infra/repositories/prisma/PrismaGenreRepository";
import { GetAllGenresUsecase } from "@/backend/genre/application/usecase/GetAllGenresUsecase";
import { withCache } from "@/lib/WithCache";
import { genreListKey } from "@/lib/CacheKey";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";

export async function GET() {
    const log = logger.child({ route: "/api/genres", method: "GET" });
    try {
        const repo = new PrismaGenreRepository();
        const usecase = new GetAllGenresUsecase(repo);
        const genres = await withCache(genreListKey(), 3600, () =>
            usecase.execute()
        );
        return NextResponse.json(genres);
    } catch (e) {
        log.error({ err: e }, "장르 조회 실패");
        return errorResponse("서버 오류", 500);
    }
}
