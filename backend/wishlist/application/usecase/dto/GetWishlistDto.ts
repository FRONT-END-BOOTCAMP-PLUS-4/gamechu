import { z } from "zod";

export const WishlistBodySchema = z.object({
    gameId: z.number().int().positive("유효하지 않은 게임 ID입니다."),
});

//위시리스트 단건 조회 요청

export class GetWishlistDto {
    constructor(
        public gameId: number,
        public memberId: string
    ) {}
}
