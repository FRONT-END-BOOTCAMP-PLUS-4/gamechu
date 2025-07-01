import { GetWishListDto } from "./GetWishListDto";

export class WishlistsDto {
    constructor(
        public wishlists: GetWishListDto[],
        public currentPage: number,
        public pages: number[],
        public endPage: number,
        public totalCount: number
    ) {}
}
