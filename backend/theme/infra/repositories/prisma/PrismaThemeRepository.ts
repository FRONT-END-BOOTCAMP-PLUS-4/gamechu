// 📁 backend/theme/infra/repositories/prisma/PrismaThemeRepository.ts
import { ThemeRepository } from "@/backend/theme/domain/repositories/ThemeRepository";
import { PrismaClient, Theme } from "@/prisma/generated";
import { prisma } from "@/lib/prisma";

export class PrismaThemeRepository implements ThemeRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async findAll(): Promise<Theme[]> {
        return await this.prisma.theme.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                id: "asc",
            },
        });
    }
}
