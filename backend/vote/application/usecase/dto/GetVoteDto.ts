export class GetVoteDto {
    constructor(
        public queryString: {
            arenaId: number;
            votedTo: string;
            mine: boolean;
        },
        public memberId: string | null
    ) {}
}
