import { PreferredThemeRepository } from "@/backend/preferred-theme/domain/repositories/PreferredThemeRepository";
import { CreatePreferredThemesDto } from "./dto/CreatePreferredThemesDto";

export class CreatePreferredThemesUsecase {
    constructor(private readonly repo: PreferredThemeRepository) {}

    async execute(dto: CreatePreferredThemesDto): Promise<void> {
        await this.repo.replaceAll(
            dto.memberId,
            dto.themeIds.map((themeId) => ({ memberId: dto.memberId, themeId }))
        );
    }
}
