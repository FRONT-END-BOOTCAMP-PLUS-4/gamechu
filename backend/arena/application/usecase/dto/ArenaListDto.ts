import { ArenaDto } from "./ArenaDto";

export class ArenaListDto {
    constructor(
        public arenas: ArenaDto[],
        public totalCount: number,
        public currentPage: number, // current page number
        public pages: number[], // array of page numbers to show in pager
        public endPage: number // last page number
    ) {}
}
