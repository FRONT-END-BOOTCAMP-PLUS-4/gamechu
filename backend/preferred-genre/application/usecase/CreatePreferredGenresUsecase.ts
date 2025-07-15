// 📁 backend/preferred-genre/application/usecase/SavePreferredGenresUsecase.ts
import {
    PreferredGenreRepository,
    CreatePreferredGenreInput,
} from "@/backend/preferred-genre/domain/repositories/PreferredGenreRepository";
import { CreatePreferredGenresDto } from "./dto/CreatePreferredGenresDto";

export class CreatePreferredGenresUsecase {
    constructor(private readonly repo: PreferredGenreRepository) {}

    async execute(dto: CreatePreferredGenresDto): Promise<void> {
        // 기존 선호 장르 모두 삭제
        await this.repo.delete(dto.memberId);

        // genreIds 하나씩 저장
        for (const genreId of dto.genreIds) {
            const genre: CreatePreferredGenreInput = {
                memberId: dto.memberId,
                genreId,
            };
            await this.repo.save(genre); // 기존 메서드 재사용
        }
    }
}
