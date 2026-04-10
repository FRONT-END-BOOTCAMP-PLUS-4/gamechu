// 📁 app/api/preferred-genres/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaPreferredGenreRepository } from "@/backend/preferred-genre/infra/repositories/prisma/PrismaPreferredGenreRepository";
import { CreatePreferredGenresUsecase } from "@/backend/preferred-genre/application/usecase/CreatePreferredGenresUsecase";
import { CreatePreferredGenresDto } from "@/backend/preferred-genre/application/usecase/dto/CreatePreferredGenresDto";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";
import { validate } from "@/utils/Validation";

const PreferredGenresBodySchema = z.object({
    genreIds: z.array(z.number().int().positive()),
});

export async function POST(req: NextRequest) {
    const log = logger.child({
        route: "/api/preferred-genres",
        method: "POST",
    });
    try {
        const memberId = await getAuthUserId();
        if (!memberId) {
            return errorResponse("Unauthorized", 401);
        }

        const body = await req.json();
        const bodyValidation = validate(PreferredGenresBodySchema, body);
        if (!bodyValidation.success) return bodyValidation.response;
        const { genreIds } = bodyValidation.data;

        const dto = new CreatePreferredGenresDto(memberId, genreIds);

        const repo = new PrismaPreferredGenreRepository();
        const usecase = new CreatePreferredGenresUsecase(repo);
        await usecase.execute(dto);

        return NextResponse.json({ message: "선호 장르 저장 완료" });
    } catch (err) {
        log.error({ err }, "선호 장르 저장 실패");
        const message =
            err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
        return errorResponse(message, 500);
    }
}
