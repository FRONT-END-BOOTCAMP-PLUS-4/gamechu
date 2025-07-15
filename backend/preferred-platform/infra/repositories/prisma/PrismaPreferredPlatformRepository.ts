// 📁 backend/preferred-platform/infra/repositories/prisma/PrismaPreferredPlatformRepository.ts
import {
    PreferredPlatformRepository,
    CreatePreferredPlatformInput,
} from "@/backend/preferred-platform/domain/repositories/PreferredPlatformRepository";
import { PrismaClient, PreferredPlatform } from "@/prisma/generated";

export class PrismaPreferredPlatformRepository
    implements PreferredPlatformRepository
{
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    // async savePreferredPlatforms(memberId: string, platformIds: number[]): Promise<void> {
    //     await this.prisma.preferredPlatform.deleteMany({ where: { memberId } });

    //     if (platformIds.length === 0) return;

    //     await this.prisma.preferredPlatform.createMany({
    //         data: platformIds.map((platformId) => ({
    //             memberId,
    //             platformId,
    //         })),
    //     });
    // }

    // async save(memberId: string, platformIds: number[]): Promise<void> {
    //     await this.prisma.preferredPlatform.deleteMany({ where: { memberId } });

    //     if (platformIds.length === 0) return;

    //     await this.prisma.preferredPlatform.createMany({
    //         data: platformIds.map((platformId) => ({
    //             memberId,
    //             platformId,
    //         })),
    //     });
    // }
    async save(
        platform: CreatePreferredPlatformInput
    ): Promise<PreferredPlatform> {
        return this.prisma.preferredPlatform.create({
            data: platform,
        });
    }

    async delete(memberId: string): Promise<void> {
        await this.prisma.preferredPlatform.deleteMany({
            where: { memberId },
        });
    }
}
