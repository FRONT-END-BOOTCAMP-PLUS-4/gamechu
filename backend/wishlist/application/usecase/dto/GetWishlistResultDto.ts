//위시리스트 단건 조회 결과

export class GetWishlistResultDto {
    constructor(
        public exists: boolean,
        public wishlistId: number | null
    ) {}
}
