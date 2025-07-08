// 위시리스트 목록 조회 요청

export class GetWishlistsDto {
    constructor(
        public memberId: string,
        public page: number
    ) {}
}
