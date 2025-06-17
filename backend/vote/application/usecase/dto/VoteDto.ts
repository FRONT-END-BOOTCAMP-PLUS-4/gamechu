export class VoteDto {
    constructor(
        public arenaId: number,
        public memberId: string,
        public leftVotes: number,
        public rightVotes: number,
        public votedTo: string | null
    ) {}
}
