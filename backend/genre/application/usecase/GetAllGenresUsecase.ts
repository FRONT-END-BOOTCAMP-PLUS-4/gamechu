import { GenreRepository } from "@/backend/genre/domain/repositories/GenreRepository";
import { Genre } from "@/prisma/generated";

export class GetAllGenresUsecase {
    constructor(private readonly genreRepo: GenreRepository) {}

    async execute(): Promise<Genre[]> {
        return await this.genreRepo.getAllGenres();
    }
}
