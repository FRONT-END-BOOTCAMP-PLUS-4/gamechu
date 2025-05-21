// 📁 backend/preferred-platform/application/usecase/SavePreferredPlatformsUsecase.ts
import { PreferredPlatformRepository } from "@/backend/preferred-platform/domain/repositories/PreferredPlatformRepository";
import { SavePreferredPlatformsRequestDto } from "./dto/SavePreferredPlatformsRequestDto";

export class SavePreferredPlatformsUsecase {
    constructor(private readonly repo: PreferredPlatformRepository) {}

    async execute(dto: SavePreferredPlatformsRequestDto): Promise<void> {
        await this.repo.savePreferredPlatforms(dto.memberId, dto.platformIds);
    }
}