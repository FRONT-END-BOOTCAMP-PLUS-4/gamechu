import {
    PreferredThemeRepository,
    CreatePreferredThemeInput,
} from "@/backend/preferred-theme/domain/repositories/PreferredThemeRepository";
import { CreatePreferredThemesDto } from "./dto/CreatePreferredThemesDto";

export class CreatePreferredThemesUsecase {
    constructor(private readonly repo: PreferredThemeRepository) {}

    async execute(dto: CreatePreferredThemesDto): Promise<void> {
        await this.repo.delete(dto.memberId);

        for (const themeId of dto.themeIds) {
            const theme: CreatePreferredThemeInput = {
                memberId: dto.memberId,
                themeId,
            };
            await this.repo.save(theme); // 기존 메서드 재사용
        }
    }
}
