import { NotificationRecordDto } from "./NotificationRecordDto";

export class NotificationRecordListDto {
    constructor(
        public records: NotificationRecordDto[],
        public currentPage: number, // current page number
        public pages: number[], // array of page numbers to show in pager
        public endPage: number // last page number
    ) {}
}
