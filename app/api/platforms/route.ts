import { NextResponse } from "next/server";
import { PrismaPlatformRepository } from "@/backend/platform/infra/repositories/prisma/PrismaPlatformRepository";
import { GetAllPlatformsUsecase } from "@/backend/platform/application/usecase/GetAllPlatformsUsecase";
import { withCache } from "@/lib/WithCache";
import { platformListKey } from "@/lib/CacheKey";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";

export async function GET() {
    const log = logger.child({ route: "/api/platforms", method: "GET" });
    try {
        const repo = new PrismaPlatformRepository();
        const usecase = new GetAllPlatformsUsecase(repo);
        const platforms = await withCache(platformListKey(), 3600, () => usecase.execute());
        return NextResponse.json(platforms);
    } catch (e) {
        log.error({ err: e }, "플랫폼 조회 실패");
        return errorResponse("서버 오류", 500);
    }
}
