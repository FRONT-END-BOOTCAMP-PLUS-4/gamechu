export class GetScoreRecordDto {
    constructor(
        public queryString: {
            currentPage: number;
            policyId: number;
        },
        public memberId: string,
        public pageSize: number,
        public sortField: string = "createdAt",
        public ascending: boolean = false
    ) {}
}
