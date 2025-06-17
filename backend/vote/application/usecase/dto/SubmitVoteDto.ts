export class SubmitVoteDto {
    constructor(
        public arenaId: number,
        public memberId: string,
        public votedTo: string
    ) {}
}
