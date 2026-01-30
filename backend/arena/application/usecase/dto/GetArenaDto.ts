export class GetArenaDto {
    constructor(
        public queryString: {
            currentPage: number;
            status: number;
            mine: boolean;
            targetMemberId?: string; // 👈 추가 (타 유저용)
        },
        public memberId: string | null,
        public pageSize: number,
        public sortField: string = "startDate",
        public ascending: boolean = false
    ) {}
}
