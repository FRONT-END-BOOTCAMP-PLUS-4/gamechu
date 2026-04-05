// 📁 app/api/preferred-themes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaPreferredThemeRepository } from "@/backend/preferred-theme/infra/repositories/prisma/PrismaPreferredThemeRepository";
import { CreatePreferredThemesUsecase } from "@/backend/preferred-theme/application/usecase/CreatePreferredThemesUsecase";
import { CreatePreferredThemesDto } from "@/backend/preferred-theme/application/usecase/dto/CreatePreferredThemesDto";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";

export async function POST(req: NextRequest) {
    const log = logger.child({ route: "/api/preferred-themes", method: "POST" });
    const memberId = await getAuthUserId();
    try {
        if (!memberId) {
            return errorResponse("Unauthorized", 401);
        }

        const { themeIds } = await req.json();
        const dto = new CreatePreferredThemesDto(memberId, themeIds);

        const repo = new PrismaPreferredThemeRepository();
        const usecase = new CreatePreferredThemesUsecase(repo);
        await usecase.execute(dto);

        return NextResponse.json(
            { message: "선호 테마 저장 완료" },
            { status: 200 }
        );
    } catch (err) {
        log.error({ userId: memberId, err }, "선호 테마 저장 실패");
        const message =
            err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
        return errorResponse(message, 500);
    }
}
