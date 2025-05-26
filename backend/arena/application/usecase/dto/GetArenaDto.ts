export class GetArenaDto {
    constructor(
        public queryString: {
            currentPage: number;
            status: number;
            mine: boolean;
        },
        public memberId: string | null,
        public pageSize: number,
        public sortField: string = "createdAt",
        public ascending: boolean = false
    ) {}
}
