import { PreferredTheme } from "@/prisma/generated";

export type CreatePreferredThemeInput = Omit<PreferredTheme, "id">;

// 📁 backend/preferred-theme/domain/repositories/PreferredThemeRepository.ts
export interface PreferredThemeRepository {
    // savePreferredThemes(memberId: string, themeIds: number[]): Promise<void>;
    //save(memberId: string, themeIds: number[]): Promise<void>;
    save(theme: CreatePreferredThemeInput): Promise<PreferredTheme>;
    delete(memberId: string): Promise<void>;
}
