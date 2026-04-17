import {
    PreferredPlatformRepository,
    CreatePreferredPlatformInput,
} from "@/backend/preferred-platform/domain/repositories/PreferredPlatformRepository";
import { prisma } from "@/lib/Prisma";

export class PrismaPreferredPlatformRepository
    implements PreferredPlatformRepository
{
    async saveMany(inputs: CreatePreferredPlatformInput[]): Promise<void> {
        await prisma.preferredPlatform.createMany({ data: inputs });
    }

    async delete(memberId: string): Promise<void> {
        await prisma.preferredPlatform.deleteMany({ where: { memberId } });
    }
}
