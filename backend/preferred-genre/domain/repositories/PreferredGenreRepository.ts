// 📁 backend/preferred-genre/domain/repositories/PreferredGenreRepository.ts
export interface PreferredGenreRepository {
    savePreferredGenres(memberId: string, genreIds: number[]): Promise<void>;
}