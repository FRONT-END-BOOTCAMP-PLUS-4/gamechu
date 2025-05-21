// 📁 backend/preferred-genre/application/usecase/SavePreferredGenresUsecase.ts
import { PreferredGenreRepository } from "@/backend/preferred-genre/domain/repositories/PreferredGenreRepository";
import { SavePreferredGenresRequestDto } from "./dto/SavePreferredGenresRequestDto";

export class SavePreferredGenresUsecase {
    constructor(private readonly repo: PreferredGenreRepository) {}

    async execute(dto: SavePreferredGenresRequestDto): Promise<void> {
        await this.repo.savePreferredGenres(dto.memberId, dto.genreIds);
    }
}