export class SavePreferredGenresRequestDto {
    constructor(
        public readonly memberId: string,
        public readonly genreIds: number[]
    ) {
        if (!memberId) throw new Error("memberId는 필수입니다.");
        if (!Array.isArray(genreIds))
            throw new Error("genreIds는 배열이어야 합니다.");
    }
}
