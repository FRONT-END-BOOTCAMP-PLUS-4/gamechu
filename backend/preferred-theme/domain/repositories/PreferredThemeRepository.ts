export type CreatePreferredThemeInput = {
    memberId: string;
    themeId: number;
};

export interface PreferredThemeRepository {
    replaceAll(memberId: string, inputs: CreatePreferredThemeInput[]): Promise<void>;
}
