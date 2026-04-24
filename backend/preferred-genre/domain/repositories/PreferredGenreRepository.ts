export type CreatePreferredGenreInput = {
    memberId: string;
    genreId: number;
};

export interface PreferredGenreRepository {
    replaceAll(memberId: string, inputs: CreatePreferredGenreInput[]): Promise<void>;
}
