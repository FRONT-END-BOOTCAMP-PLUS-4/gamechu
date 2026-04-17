import {
    PreferredThemeRepository,
    CreatePreferredThemeInput,
} from "@/backend/preferred-theme/domain/repositories/PreferredThemeRepository";
import { prisma } from "@/lib/Prisma";

export class PrismaPreferredThemeRepository
    implements PreferredThemeRepository
{
    async saveMany(inputs: CreatePreferredThemeInput[]): Promise<void> {
        await prisma.preferredTheme.createMany({ data: inputs });
    }

    async delete(memberId: string): Promise<void> {
        await prisma.preferredTheme.deleteMany({ where: { memberId } });
    }
}
