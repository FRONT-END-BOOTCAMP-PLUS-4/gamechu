// 📁 backend/preferred-theme/application/usecase/dto/SavePreferredThemesRequestDto.ts
export class SavePreferredThemesRequestDto {
    constructor(
        public readonly memberId: string,
        public readonly themeIds: number[]
    ) {
        if (!memberId) throw new Error("memberId는 필수입니다.");
        if (!Array.isArray(themeIds)) throw new Error("themeIds는 배열이어야 합니다.");
    }
}