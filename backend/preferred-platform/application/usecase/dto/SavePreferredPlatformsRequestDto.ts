// 📁 backend/preferred-platform/application/usecase/dto/SavePreferredPlatformsRequestDto.ts
export class SavePreferredPlatformsRequestDto {
    constructor(
        public readonly memberId: string,
        public readonly platformIds: number[]
    ) {
        if (!memberId) throw new Error("memberId는 필수입니다.");
        if (!Array.isArray(platformIds))
            throw new Error("platformIds는 배열이어야 합니다.");
    }
}
