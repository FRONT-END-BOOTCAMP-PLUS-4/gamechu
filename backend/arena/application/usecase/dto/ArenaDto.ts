export class ArenaDto {
    constructor(
        public id: number,
        public creatorId: string,
        public challengerId: string | null,
        public title: string,
        public description: string,
        public status: number,
        public startDate: Date,

        public debateEndDate: Date,
        public voteEndDate: Date,

        public creatorNickname: string,
        public creatorProfileImageUrl: string,
        public creatorScore: number,
        public challengerNickname: string | null,
        public challengerProfileImageUrl: string | null,
        public challengerScore: number | null,
        public voteCount: number,
        public leftPercent: number
    ) {}
}
