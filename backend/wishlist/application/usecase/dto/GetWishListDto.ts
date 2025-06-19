export class GetWishListDto {
    constructor(
        public id: number,
        public title: string,
        public developer: string,
        public thumbnail: string,
        public platform: string,
        public expertRating: number,
        public reviewCount: number,
    ) {}
}
