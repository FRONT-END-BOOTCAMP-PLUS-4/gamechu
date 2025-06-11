export class ScoreRecordFilter {
    constructor(
        public policyId: number | null,
        public memberId: string,
        public sortField: string = "createdAt",
        public ascending: boolean = false,
        public offset: number = 0,
        public limit: number = 9
    ) {}
}
