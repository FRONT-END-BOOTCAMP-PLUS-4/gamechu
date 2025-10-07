//위시리스트 단건 조회 요청

export class GetWishlistDto {
    constructor(
        public gameId: number,
        public memberId: string
    ) {}
}
