// 📁 backend/preferred-platform/infra/repositories/prisma/PrismaPreferredPlatformRepository.ts
import { PreferredPlatformRepository } from "@/backend/preferred-platform/domain/repositories/PreferredPlatformRepository";
import { PrismaClient } from "@/prisma/generated";

export class PrismaPreferredPlatformRepository
    implements PreferredPlatformRepository
{
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async savePreferredPlatforms(
        memberId: string,
        platformIds: number[]
    ): Promise<void> {
        await this.prisma.preferredPlatform.deleteMany({ where: { memberId } });

        if (platformIds.length === 0) return;

        await this.prisma.preferredPlatform.createMany({
            data: platformIds.map((platformId) => ({
                memberId,
                platformId,
            })),
        });
    }
}
