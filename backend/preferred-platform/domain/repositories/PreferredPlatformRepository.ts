// 📁 backend/preferred-platform/domain/repositories/PreferredPlatformRepository.ts
export interface PreferredPlatformRepository {
    // savePreferredPlatforms(memberId: string, platformIds: number[]): Promise<void>;
    save(memberId: string, platformIds: number[]): Promise<void>;
}
