import { ScoreRecordDto } from "./ScoreRecordDto";

export class ScoreRecordListDto {
    constructor(
        public records: ScoreRecordDto[],
        public currentPage: number, // current page number
        public pages: number[], // array of page numbers to show in pager
        public endPage: number // last page number
    ) {}
}
