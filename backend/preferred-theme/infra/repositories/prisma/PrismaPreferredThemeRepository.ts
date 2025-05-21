// 📁 backend/preferred-theme/infra/repositories/prisma/PrismaPreferredThemeRepository.ts
import { PreferredThemeRepository } from "@/backend/preferred-theme/domain/repositories/PreferredThemeRepository";
import { PrismaClient } from "@/prisma/generated";

export class PrismaPreferredThemeRepository implements PreferredThemeRepository {

    private prisma: PrismaClient;
    
        constructor() {
            this.prisma = new PrismaClient();
        }
    async savePreferredThemes(memberId: string, themeIds: number[]): Promise<void> {
        await this.prisma.preferredTheme.deleteMany({ where: { memberId } });

        if (themeIds.length === 0) return;

        await this.prisma.preferredTheme.createMany({
            data: themeIds.map((themeId) => ({
                memberId,
                themeId,
            })),
        });
    }
}