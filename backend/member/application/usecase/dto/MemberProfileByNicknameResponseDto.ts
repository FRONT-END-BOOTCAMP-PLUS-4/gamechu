// ✅ /backend/member/application/usecase/dto/MemberProfileByNicknameResponseDto.ts
export class MemberProfileByNicknameResponseDto {
    constructor(
        public id: string,
        public nickname: string,
        public imageUrl: string,
        public score: number
    ) {}
}
