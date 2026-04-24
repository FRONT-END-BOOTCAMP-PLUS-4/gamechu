import {
    PreferredGenreRepository,
    CreatePreferredGenreInput,
} from "@/backend/preferred-genre/domain/repositories/PreferredGenreRepository";
import { prisma } from "@/lib/Prisma";

export class PrismaPreferredGenreRepository
    implements PreferredGenreRepository
{
    async replaceAll(memberId: string, inputs: CreatePreferredGenreInput[]): Promise<void> {
        await prisma.$transaction([
            prisma.preferredGenre.deleteMany({ where: { memberId } }),
            prisma.preferredGenre.createMany({ data: inputs }),
        ]);
    }
}
