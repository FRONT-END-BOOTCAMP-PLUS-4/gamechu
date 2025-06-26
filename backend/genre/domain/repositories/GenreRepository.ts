import { Genre } from "@/prisma/generated";

export interface GenreRepository {
    getAllGenres(): Promise<Genre[]>;
}
