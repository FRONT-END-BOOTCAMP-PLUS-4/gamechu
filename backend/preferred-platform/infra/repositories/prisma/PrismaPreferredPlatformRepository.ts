// 📁 backend/preferred-platform/infra/repositories/prisma/PrismaPreferredPlatformRepository.ts
import {
    PreferredPlatformRepository,
    CreatePreferredPlatformInput,
} from "@/backend/preferred-platform/domain/repositories/PreferredPlatformRepository";
import { PrismaClient, PreferredPlatform } from "@/prisma/generated";
import { prisma } from "@/lib/Prisma";

export class PrismaPreferredPlatformRepository
    implements PreferredPlatformRepository
{
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

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
