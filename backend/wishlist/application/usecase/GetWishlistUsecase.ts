// backend/wishlist/application/usecase/GetWishlistUsecase.ts
import { WishListRepository } from "../../domain/repositories/WishListRepository";
import { GetWishlistDto } from "./dto/GetWishlistDto";
import { GetWishlistResultDto } from "./dto/GetWishlistResultDto";

export class GetWishlistUsecase {
    constructor(private readonly wishlistRepo: WishListRepository) {}

    async execute(
        getWishlistDto: GetWishlistDto
    ): Promise<GetWishlistResultDto> {
        const wishlist = await this.wishlistRepo.findById(
            getWishlistDto.memberId,
            getWishlistDto.gameId
        );

        const getWishlistResultDto: GetWishlistResultDto = {
            exists: !!wishlist,
            wishlistId: wishlist?.id ?? null,
        };

        return getWishlistResultDto;
    }
}
