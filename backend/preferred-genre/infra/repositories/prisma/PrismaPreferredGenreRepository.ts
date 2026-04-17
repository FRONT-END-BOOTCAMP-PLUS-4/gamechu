import {
    PreferredGenreRepository,
    CreatePreferredGenreInput,
} from "@/backend/preferred-genre/domain/repositories/PreferredGenreRepository";
import { prisma } from "@/lib/Prisma";

export class PrismaPreferredGenreRepository
    implements PreferredGenreRepository
{
    async saveMany(inputs: CreatePreferredGenreInput[]): Promise<void> {
        await prisma.preferredGenre.createMany({ data: inputs });
    }

    async delete(memberId: string): Promise<void> {
        await prisma.preferredGenre.deleteMany({ where: { memberId } });
    }
}
