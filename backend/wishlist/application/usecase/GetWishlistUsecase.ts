// backend/wishlist/application/usecase/GetWishlistUsecase.ts
import { WishListRepository } from "../../domain/repositories/WishListRepository";

export class GetWishlistUsecase {
    constructor(private readonly wishlistRepo: WishListRepository) {}

    async execute(memberId: string, gameId: number): Promise<{ exists: boolean; wishlistId: number | null }> {
        const wishlist = await this.wishlistRepo.findById(memberId, gameId);
        return {
            exists: !!wishlist,
            wishlistId: wishlist?.id ?? null,
        };
    }
}