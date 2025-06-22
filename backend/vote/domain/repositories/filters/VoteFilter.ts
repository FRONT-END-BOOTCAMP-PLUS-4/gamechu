export class VoteFilter {
    constructor(
        public arenaId: number | null,
        public memberId: string | null,
        public votedTo?: string | null
    ) {}
}
