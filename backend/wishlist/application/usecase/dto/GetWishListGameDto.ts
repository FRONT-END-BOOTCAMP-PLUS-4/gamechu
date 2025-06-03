export class GetWishListGameDto {
    constructor(
        public readonly id: number,
        public readonly title: string,
        public readonly developer: string,
        public readonly thumbnail: string,
        public readonly platform: string,
        public readonly expertRating: number,
        public readonly reviewCount: number,
    ) {}
}
