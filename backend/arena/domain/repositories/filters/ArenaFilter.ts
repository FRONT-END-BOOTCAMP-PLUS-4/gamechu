export class ArenaFilter {
    constructor(
        public status: number | null,
        public memberId: string | null,
        public sortField: string = "startDate",
        public ascending: boolean = false,
        public offset: number = 0,
        public limit: number = 9
    ) {}
}
