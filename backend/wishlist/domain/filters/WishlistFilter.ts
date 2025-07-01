// backend/wishlist/domain/filters/WishlistFilter.ts
export class WishlistFilter {
    constructor(
        public memberId: string,
        public sortField: string = "id",
        public ascending: boolean = false,
        public offset: number = 0,
        public limit: number = 4
    ) {}
}
