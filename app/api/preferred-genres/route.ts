// 📁 app/api/preferred-genres/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaPreferredGenreRepository } from "@/backend/preferred-genre/infra/repositories/prisma/PrismaPreferredGenreRepository";
import { CreatePreferredGenresUsecase } from "@/backend/preferred-genre/application/usecase/CreatePreferredGenresUsecase";
import { CreatePreferredGenresDto } from "@/backend/preferred-genre/application/usecase/dto/CreatePreferredGenresDto";

export async function POST(req: NextRequest) {
    try {
        const memberId = await getAuthUserId();
        if (!memberId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { genreIds } = await req.json();
        const dto = new CreatePreferredGenresDto(memberId, genreIds);

        const repo = new PrismaPreferredGenreRepository();
        const usecase = new CreatePreferredGenresUsecase(repo);
        await usecase.execute(dto);

        return NextResponse.json(
            { message: "선호 장르 저장 완료" },
            { status: 200 }
        );
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
