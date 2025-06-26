export class GetNotificationRecordDto {
    constructor(
        public currentPage: number,
        public memberId: string
    ) {}
}
