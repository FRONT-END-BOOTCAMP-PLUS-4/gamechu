// ✅ /backend/member/application/usecase/dto/MemberProfileByNicknameResponseDto.ts
export class MemberProfileByNicknameResponseDto {
    constructor(
        public id: string,
        public nickname: string,
        public password: string,
        public email: string,
        public imageUrl: string,
        public birthDate: string,
        public isMale: boolean,
        public score: number,
        public createdAt: string
    ) {}
}
