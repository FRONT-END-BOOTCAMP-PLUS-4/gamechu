// 📁 app/api/preferred-themes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaPreferredThemeRepository } from "@/backend/preferred-theme/infra/repositories/prisma/PrismaPreferredThemeRepository";
import { CreatePreferredThemesUsecase } from "@/backend/preferred-theme/application/usecase/CreatePreferredThemesUsecase";
import { CreatePreferredThemesDto } from "@/backend/preferred-theme/application/usecase/dto/CreatePreferredThemesDto";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";
import { validate } from "@/utils/Validation";

const PreferredThemesBodySchema = z.object({
    themeIds: z.array(z.number().int().positive()),
});

export async function POST(req: NextRequest) {
    const log = logger.child({
        route: "/api/preferred-themes",
        method: "POST",
    });
    const memberId = await getAuthUserId();
    try {
        if (!memberId) {
            return errorResponse("Unauthorized", 401);
        }

        const body = await req.json();
        const bodyValidation = validate(PreferredThemesBodySchema, body);
        if (!bodyValidation.success) return bodyValidation.response;
        const { themeIds } = bodyValidation.data;

        const dto = new CreatePreferredThemesDto(memberId, themeIds);

        const repo = new PrismaPreferredThemeRepository();
        const usecase = new CreatePreferredThemesUsecase(repo);
        await usecase.execute(dto);

        return NextResponse.json({ message: "선호 테마 저장 완료" });
    } catch (err) {
        log.error({ userId: memberId, err }, "선호 테마 저장 실패");
        const message =
            err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
        return errorResponse(message, 500);
    }
}
