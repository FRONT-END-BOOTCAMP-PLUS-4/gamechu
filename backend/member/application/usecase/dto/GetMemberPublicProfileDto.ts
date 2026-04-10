export class GetMemberPublicProfileDto {
    constructor(
        public id: string,
        public nickname: string,
        public imageUrl: string,
        public score: number
    ) {}
}
