// 📁 app/api/preferred-platforms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaPreferredPlatformRepository } from "@/backend/preferred-platform/infra/repositories/prisma/PrismaPreferredPlatformRepository";
import { SavePreferredPlatformsUsecase } from "@/backend/preferred-platform/application/usecase/SavePreferredPlatformsUsecase";
import { SavePreferredPlatformsRequestDto } from "@/backend/preferred-platform/application/usecase/dto/SavePreferredPlatformsRequestDto";

export async function POST(req: NextRequest) {
    try {
        const memberId = await getAuthUserId();
        if (!memberId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { platformIds } = await req.json();
        const dto = new SavePreferredPlatformsRequestDto(memberId, platformIds);

        const repo = new PrismaPreferredPlatformRepository();
        const usecase = new SavePreferredPlatformsUsecase(repo);
        await usecase.execute(dto);

        return NextResponse.json(
            { message: "선호 플랫폼 저장 완료" },
            { status: 200 }
        );
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
