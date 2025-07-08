//위시리스트 DTO

export class WishlistDto {
    constructor(
        public id: number,
        public title: string,
        public developer: string,
        public thumbnail: string,
        public platform: string,
        public expertRating: number,
        public reviewCount: number
    ) {}
}
