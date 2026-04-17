import { PreferredGenreRepository } from "@/backend/preferred-genre/domain/repositories/PreferredGenreRepository";
import { CreatePreferredGenresDto } from "./dto/CreatePreferredGenresDto";

export class CreatePreferredGenresUsecase {
    constructor(private readonly repo: PreferredGenreRepository) {}

    async execute(dto: CreatePreferredGenresDto): Promise<void> {
        await this.repo.delete(dto.memberId);
        await this.repo.saveMany(
            dto.genreIds.map((genreId) => ({
                memberId: dto.memberId,
                genreId,
            }))
        );
    }
}
