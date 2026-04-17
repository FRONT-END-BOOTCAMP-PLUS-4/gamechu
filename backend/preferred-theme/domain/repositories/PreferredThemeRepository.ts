export type CreatePreferredThemeInput = {
    memberId: string;
    themeId: number;
};

export interface PreferredThemeRepository {
    saveMany(inputs: CreatePreferredThemeInput[]): Promise<void>;
    delete(memberId: string): Promise<void>;
}
