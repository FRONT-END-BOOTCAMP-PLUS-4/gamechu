import {
    PreferredPlatformRepository,
    CreatePreferredPlatformInput,
} from "@/backend/preferred-platform/domain/repositories/PreferredPlatformRepository";
import { prisma } from "@/lib/Prisma";

export class PrismaPreferredPlatformRepository
    implements PreferredPlatformRepository
{
    async replaceAll(memberId: string, inputs: CreatePreferredPlatformInput[]): Promise<void> {
        await prisma.$transaction([
            prisma.preferredPlatform.deleteMany({ where: { memberId } }),
            prisma.preferredPlatform.createMany({ data: inputs }),
        ]);
    }
}
