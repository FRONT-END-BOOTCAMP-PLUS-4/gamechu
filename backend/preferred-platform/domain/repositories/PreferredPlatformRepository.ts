// 📁 backend/preferred-platform/domain/repositories/PreferredPlatformRepository.ts
export interface PreferredPlatformRepository {
    savePreferredPlatforms(
        memberId: string,
        platformIds: number[]
    ): Promise<void>;
}
