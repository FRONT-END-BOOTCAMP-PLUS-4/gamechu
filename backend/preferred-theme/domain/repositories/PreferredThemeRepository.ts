// 📁 backend/preferred-theme/domain/repositories/PreferredThemeRepository.ts
export interface PreferredThemeRepository {
    savePreferredThemes(memberId: string, themeIds: number[]): Promise<void>;
}
