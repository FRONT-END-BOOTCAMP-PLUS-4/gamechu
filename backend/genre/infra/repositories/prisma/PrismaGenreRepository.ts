// backend/genre/infra/repositories/prisma/PrismaGenreRepository.ts
import { PrismaClient, Genre } from "@/prisma/generated";
import { GenreRepository } from "@/backend/genre/domain/repositories/GenreRepository";

export class PrismaGenreRepository implements GenreRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
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
