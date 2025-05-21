// 📁 backend/theme/application/usecase/FindAllThemesUsecase.ts
import { ThemeRepository } from "@/backend/theme/domain/repositories/ThemeRepository";
import { Theme } from "@/prisma/generated";

export class GetAllThemesUsecase {
    constructor(private readonly repo: ThemeRepository) {}

    async execute(): Promise<Theme[]> {
        return await this.repo.getAllThemes();
    }
}