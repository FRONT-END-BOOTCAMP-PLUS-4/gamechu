// 📁 app/api/platforms/route.ts
import { NextResponse } from "next/server";
import { PrismaPlatformRepository } from "@/backend/platform/infra/repositories/prisma/PrismaPlatformRepository";
import { GetAllPlatformsUsecase } from "@/backend/platform/application/usecase/GetAllPlatformsUsecase";

export async function GET() {
    try {
        const repo = new PrismaPlatformRepository();
        const usecase = new GetAllPlatformsUsecase(repo);
        const platforms = await usecase.execute();

        return NextResponse.json(platforms);
    } catch (e) {
        console.error("[GET /platforms] 플랫폼 조회 실패:", e);
        return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
}
