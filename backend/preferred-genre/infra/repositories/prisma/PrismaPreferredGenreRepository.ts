import { PreferredGenreRepository } from "@/backend/preferred-genre/domain/repositories/PreferredGenreRepository";
import { PrismaClient, PreferredGenre } from "@/prisma/generated";
import { CreatePreferredGenreInput } from "@/backend/preferred-genre/domain/repositories/PreferredGenreRepository";
import { prisma } from "@/lib/prisma";

export class PrismaPreferredGenreRepository
    implements PreferredGenreRepository
{
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async save(
        preferredGenre: CreatePreferredGenreInput
    ): Promise<PreferredGenre> {
        const data = await this.prisma.preferredGenre.create({
            data: preferredGenre,
        });

        return data;
    }

    async delete(memberId: string): Promise<void> {
        await this.prisma.preferredGenre.deleteMany({ where: { memberId } });
    }
}
