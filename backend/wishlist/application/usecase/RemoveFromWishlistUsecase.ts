import { WishListRepository } from "../../domain/repositories/WishListRepository";

export class RemoveFromWishlistUsecase {
    constructor(private readonly wishlistRepo: WishListRepository) {}

    async execute(memberId: string, gameId: number): Promise<void> {
        const exists = await this.wishlistRepo.isWished(memberId, gameId);
        if (!exists) {
            throw new Error("위시리스트에 존재하지 않습니다.");
        }

        await this.wishlistRepo.removeFromWishlist(memberId, gameId);
    }
}
