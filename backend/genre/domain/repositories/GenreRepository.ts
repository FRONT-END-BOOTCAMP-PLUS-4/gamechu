import { Genre } from "@/prisma/generated";

export interface GenreRepository {
    findAll(): Promise<Genre[]>;
}
