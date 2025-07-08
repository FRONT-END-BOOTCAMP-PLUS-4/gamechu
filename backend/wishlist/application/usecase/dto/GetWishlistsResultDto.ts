//위시리스트 목록 조회 결과 DTO

import { WishlistDto } from "./WishlistDto";

export class GetWishlistsResultDto {
    constructor(
        public wishlists: WishlistDto[],
        public currentPage: number,
        public pages: number[],
        public endPage: number,
        public totalCount: number
    ) {}
}
