export class SubmitVoteDto {
    constructor(
        public readonly arenaId: number,
        public readonly memberId: string,
        public readonly votedTo: string
    ) {}
}
