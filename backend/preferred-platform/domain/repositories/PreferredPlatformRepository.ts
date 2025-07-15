import { PreferredPlatform } from "@/prisma/generated";

export type CreatePreferredPlatformInput = Omit<PreferredPlatform, "id">;

// 📁 backend/preferred-platform/domain/repositories/PreferredPlatformRepository.ts
export interface PreferredPlatformRepository {
    // savePreferredPlatforms(memberId: string, platformIds: number[]): Promise<void>;
    // save(memberId: string, platformIds: number[]): Promise<void>;
    save(platform: CreatePreferredPlatformInput): Promise<PreferredPlatform>;
    delete(memberId: string): Promise<void>; // ✅ 추가
}
