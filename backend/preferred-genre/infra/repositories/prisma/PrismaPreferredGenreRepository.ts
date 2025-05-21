import { PreferredGenreRepository } from "@/backend/preferred-genre/domain/repositories/PreferredGenreRepository";
import { PrismaClient, } from "@/prisma/generated";

export class PrismaPreferredGenreRepository implements PreferredGenreRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async savePreferredGenres(memberId: string, genreIds: number[]): Promise<void> {
        await this.prisma.preferredGenre.deleteMany({ where: { memberId } });

        if (genreIds.length === 0) return;

        await this.prisma.preferredGenre.createMany({
            data: genreIds.map((genreId) => ({
                memberId,
                genreId,
            })),
        });
    }
}