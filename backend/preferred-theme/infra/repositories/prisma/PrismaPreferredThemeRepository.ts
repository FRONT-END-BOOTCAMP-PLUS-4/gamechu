import {
    PreferredThemeRepository,
    CreatePreferredThemeInput,
} from "@/backend/preferred-theme/domain/repositories/PreferredThemeRepository";
import { prisma } from "@/lib/Prisma";

export class PrismaPreferredThemeRepository
    implements PreferredThemeRepository
{
    async replaceAll(memberId: string, inputs: CreatePreferredThemeInput[]): Promise<void> {
        await prisma.$transaction([
            prisma.preferredTheme.deleteMany({ where: { memberId } }),
            prisma.preferredTheme.createMany({ data: inputs }),
        ]);
    }
}
