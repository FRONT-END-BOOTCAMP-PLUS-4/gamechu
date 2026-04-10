import { NextResponse } from "next/server";
import { PrismaThemeRepository } from "@/backend/theme/infra/repositories/prisma/PrismaThemeRepository";
import { GetAllThemesUsecase } from "@/backend/theme/application/usecase/GetAllThemesUsecase";
import { withCache } from "@/lib/WithCache";
import { themeListKey } from "@/lib/CacheKey";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";

export async function GET() {
    const log = logger.child({ route: "/api/themes", method: "GET" });
    try {
        const repo = new PrismaThemeRepository();
        const usecase = new GetAllThemesUsecase(repo);
        const themes = await withCache(themeListKey(), 3600, () =>
            usecase.execute()
        );
        return NextResponse.json(themes);
    } catch (e) {
        log.error({ err: e }, "테마 조회 실패");
        return errorResponse("서버 오류", 500);
    }
}
