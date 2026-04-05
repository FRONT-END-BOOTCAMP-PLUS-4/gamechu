// backend/genre/infra/repositories/prisma/PrismaGenreRepository.ts
import { PrismaClient, Genre } from "@/prisma/generated";
import { GenreRepository } from "@/backend/genre/domain/repositories/GenreRepository";
import { prisma } from "@/lib/Prisma";

export class PrismaGenreRepository implements GenreRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async findAll(): Promise<Genre[]> {
        const genres = await this.prisma.genre.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return genres;
    }
}
