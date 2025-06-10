// 📁 backend/preferred-genre/application/usecase/SavePreferredGenresUsecase.ts
import { PreferredGenreRepository } from "@/backend/preferred-genre/domain/repositories/PreferredGenreRepository";
import { CreatePreferredGenresDto } from "./dto/CreatePreferredGenresDto";

export class CreatePreferredGenresUsecase {
    constructor(private readonly repo: PreferredGenreRepository) {}

    async execute(dto: CreatePreferredGenresDto): Promise<void> {
        await this.repo.save(dto.memberId, dto.genreIds);
    }
}
