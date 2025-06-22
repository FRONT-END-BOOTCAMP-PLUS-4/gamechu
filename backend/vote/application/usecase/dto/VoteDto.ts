export class VoteDto {
    constructor(
        public id: number,
        public memberId: string,
        public arenaId: number,
        public votedTo: string | null
    ) {}
}
