export type CreatePreferredGenreInput = {
    memberId: string;
    genreId: number;
};

export interface PreferredGenreRepository {
    saveMany(inputs: CreatePreferredGenreInput[]): Promise<void>;
    delete(memberId: string): Promise<void>;
}
