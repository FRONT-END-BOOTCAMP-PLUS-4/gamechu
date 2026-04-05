// 📁 app/api/preferred-platforms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaPreferredPlatformRepository } from "@/backend/preferred-platform/infra/repositories/prisma/PrismaPreferredPlatformRepository";
import { CreatePreferredPlatformsUsecase } from "@/backend/preferred-platform/application/usecase/CreatePreferredPlatformsUsecase";
import { CreatePreferredPlatformsDto } from "@/backend/preferred-platform/application/usecase/dto/CreatePreferredPlatformsDto";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";

export async function POST(req: NextRequest) {
    const log = logger.child({ route: "/api/preferred-platforms", method: "POST" });
    try {
        const memberId = await getAuthUserId();
        if (!memberId) {
            return errorResponse("Unauthorized", 401);
        }

        const { platformIds } = await req.json();
        const dto = new CreatePreferredPlatformsDto(memberId, platformIds);

        const repo = new PrismaPreferredPlatformRepository();
        const usecase = new CreatePreferredPlatformsUsecase(repo);
        await usecase.execute(dto);

        return NextResponse.json(
            { message: "선호 플랫폼 저장 완료" },
            { status: 200 }
        );
    } catch (err) {
        log.error({ err }, "선호 플랫폼 저장 실패");
        const message =
            err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
        return errorResponse(message, 500);
    }
}
