// 📁 backend/preferred-platform/application/usecase/SavePreferredPlatformsUsecase.ts
import {
    PreferredPlatformRepository,
    CreatePreferredPlatformInput,
} from "@/backend/preferred-platform/domain/repositories/PreferredPlatformRepository";
import { CreatePreferredPlatformsDto } from "./dto/CreatePreferredPlatformsDto";

export class CreatePreferredPlatformsUsecase {
    constructor(private readonly repo: PreferredPlatformRepository) {}

    async execute(dto: CreatePreferredPlatformsDto): Promise<void> {
        await this.repo.delete(dto.memberId);

        for (const platformId of dto.platformIds) {
            const platform: CreatePreferredPlatformInput = {
                memberId: dto.memberId,
                platformId,
            };
            await this.repo.save(platform);
        }
    }
}
