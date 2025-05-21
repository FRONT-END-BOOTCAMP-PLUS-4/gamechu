// 📁 backend/platform/application/usecase/FindAllPlatformsUsecase.ts
import { PlatformRepository } from "@/backend/platform/domain/repositories/PlatformRepository";
import { Platform } from "@/prisma/generated";

export class GetAllPlatformsUsecase {
    constructor(private readonly repo: PlatformRepository) {}

    async execute(): Promise<Platform[]> {
        return await this.repo.getAllPlatforms();
    }
}