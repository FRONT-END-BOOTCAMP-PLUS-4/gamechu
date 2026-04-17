import { PreferredPlatformRepository } from "@/backend/preferred-platform/domain/repositories/PreferredPlatformRepository";
import { CreatePreferredPlatformsDto } from "./dto/CreatePreferredPlatformsDto";

export class CreatePreferredPlatformsUsecase {
    constructor(private readonly repo: PreferredPlatformRepository) {}

    async execute(dto: CreatePreferredPlatformsDto): Promise<void> {
        await this.repo.delete(dto.memberId);
        await this.repo.saveMany(
            dto.platformIds.map((platformId) => ({
                memberId: dto.memberId,
                platformId,
            }))
        );
    }
}
