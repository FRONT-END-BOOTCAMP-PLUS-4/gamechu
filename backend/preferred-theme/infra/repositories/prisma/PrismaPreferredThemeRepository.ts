// 📁 backend/preferred-theme/infra/repositories/prisma/PrismaPreferredThemeRepository.ts
import { PreferredThemeRepository } from "@/backend/preferred-theme/domain/repositories/PreferredThemeRepository";
import { PrismaClient, PreferredTheme } from "@/prisma/generated";
import { CreatePreferredThemeInput } from "@/backend/preferred-theme/domain/repositories/PreferredThemeRepository";
import { prisma } from "@/lib/prisma";

export class PrismaPreferredThemeRepository
    implements PreferredThemeRepository
{
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async save(
        preferredTheme: CreatePreferredThemeInput
    ): Promise<PreferredTheme> {
        const data = await this.prisma.preferredTheme.create({
            data: preferredTheme,
        });
        return data;
    }

    async delete(memberId: string): Promise<void> {
        await this.prisma.preferredTheme.deleteMany({ where: { memberId } });
    }
}
