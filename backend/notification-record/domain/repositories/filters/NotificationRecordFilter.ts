export class NotificationRecordFilter {
    constructor(
        public memberId: string | null,
        public typeId: number | null,
        public createdAt: Date[] | null,
        public sortField: string = "createdAt",
        public ascending: boolean = false,
        public offset: number = 0,
        public limit: number = 5
    ) {}
}
