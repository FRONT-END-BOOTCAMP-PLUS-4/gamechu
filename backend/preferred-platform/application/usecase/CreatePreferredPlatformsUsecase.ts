// 📁 backend/preferred-platform/application/usecase/SavePreferredPlatformsUsecase.ts
import { PreferredPlatformRepository } from "@/backend/preferred-platform/domain/repositories/PreferredPlatformRepository";
import { CreatePreferredPlatformsDto  } from "./dto/CreatePreferredPlatformsDto";

export class CreatePreferredPlatformsUsecase {
    constructor(private readonly repo: PreferredPlatformRepository) {}

    async execute(dto: CreatePreferredPlatformsDto): Promise<void> {
        await this.repo.save(dto.memberId, dto.platformIds);
    }
}
