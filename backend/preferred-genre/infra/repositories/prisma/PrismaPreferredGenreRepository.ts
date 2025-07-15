import { PreferredGenreRepository } from "@/backend/preferred-genre/domain/repositories/PreferredGenreRepository";
import { PrismaClient, PreferredGenre } from "@/prisma/generated";
import { CreatePreferredGenreInput } from "@/backend/preferred-genre/domain/repositories/PreferredGenreRepository";

export class PrismaPreferredGenreRepository
    implements PreferredGenreRepository
{
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    // async savePreferredGenres(memberId: string, genreIds: number[]): Promise<void> {
    //     await this.prisma.preferredGenre.deleteMany({ where: { memberId } });

    //     if (genreIds.length === 0) return;

    //     await this.prisma.preferredGenre.createMany({
    //         data: genreIds.map((genreId) => ({
    //             memberId,
    //             genreId,
    //         })),
    //     });
    // }

    // async save(memberId: string, genreIds: number[]): Promise<void> {
    //     await this.prisma.preferredGenre.deleteMany({ where: { memberId } });

    //     if (genreIds.length === 0) return;

    //     await this.prisma.preferredGenre.createMany({
    //         data: genreIds.map((genreId) => ({
    //             memberId,
    //             genreId,
    //         })),
    //     });
    // }

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
