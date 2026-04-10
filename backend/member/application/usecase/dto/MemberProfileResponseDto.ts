export class MemberProfileResponseDto {
    constructor(
        public nickname: string,
        public email: string,
        public imageUrl: string,
        public birthDate: string,
        public isMale: boolean,
        public score: number,
        public createdAt: string
    ) {}
}
