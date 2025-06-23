import { GenreRepository } from "@/backend/genre/domain/repositories/GenreRepository";
import { ThemeRepository } from "@/backend/theme/domain/repositories/ThemeRepository";
import { PlatformRepository } from "@/backend/platform/domain/repositories/PlatformRepository";

export class GetGameMetaDataUsecase {
    constructor(
        private genreRepo: GenreRepository,
        private themeRepo: ThemeRepository,
        private platformRepo: PlatformRepository
    ) {}

    async execute() {
        const [genres, themes, platforms] = await Promise.all([
            this.genreRepo.getAllGenres(),
            this.themeRepo.getAllThemes(),
            this.platformRepo.getAllPlatforms(),
        ]);

        return { genres, themes, platforms };
    }
}
