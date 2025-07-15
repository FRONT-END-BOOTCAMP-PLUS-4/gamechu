import { PreferredGenre } from "@/prisma/generated";

// 📁 backend/preferred-genre/domain/repositories/PreferredGenreRepository.ts
export type CreatePreferredGenreInput = Omit<PreferredGenre, "id">;

export interface PreferredGenreRepository {
    // savePreferredGenres(memberId: string, genreIds: number[]): Promise<void>;
    // save(memberId: string, genreIds: number[]): Promise<void>;
    save(genre: CreatePreferredGenreInput): Promise<PreferredGenre>;
    delete(memberId: string): Promise<void>; // ✅ 추가
}
