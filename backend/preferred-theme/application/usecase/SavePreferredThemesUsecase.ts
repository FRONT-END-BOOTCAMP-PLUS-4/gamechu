import { PreferredThemeRepository } from "@/backend/preferred-theme/domain/repositories/PreferredThemeRepository";
import { SavePreferredThemesRequestDto } from "./dto/SavePreferredThemesRequestDto";

export class SavePreferredThemesUsecase {
    constructor(private readonly repo: PreferredThemeRepository) {}

    async execute(dto: SavePreferredThemesRequestDto): Promise<void> {
        await this.repo.savePreferredThemes(dto.memberId, dto.themeIds);
    }
}
