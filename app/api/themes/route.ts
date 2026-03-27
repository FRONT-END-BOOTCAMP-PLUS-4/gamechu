import { NextResponse } from "next/server";
import { PrismaThemeRepository } from "@/backend/theme/infra/repositories/prisma/PrismaThemeRepository";
import { GetAllThemesUsecase } from "@/backend/theme/application/usecase/GetAllThemesUsecase";
import { withCache } from "@/lib/withCache";
import { themeListKey } from "@/lib/cacheKey";

export async function GET() {
    try {
        const repo = new PrismaThemeRepository();
        const usecase = new GetAllThemesUsecase(repo);
        const themes = await withCache(themeListKey(), 3600, () => usecase.execute());
        return NextResponse.json(themes);
    } catch (e) {
        console.error("[GET /themes] 테마 조회 실패:", e);
        return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
}
