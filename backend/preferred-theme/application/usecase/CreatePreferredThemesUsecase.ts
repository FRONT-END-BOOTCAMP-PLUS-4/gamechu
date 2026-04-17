import { PreferredThemeRepository } from "@/backend/preferred-theme/domain/repositories/PreferredThemeRepository";
import { CreatePreferredThemesDto } from "./dto/CreatePreferredThemesDto";

export class CreatePreferredThemesUsecase {
    constructor(private readonly repo: PreferredThemeRepository) {}

    async execute(dto: CreatePreferredThemesDto): Promise<void> {
        await this.repo.delete(dto.memberId);
        await this.repo.saveMany(
            dto.themeIds.map((themeId) => ({
                memberId: dto.memberId,
                themeId,
            }))
        );
    }
}
