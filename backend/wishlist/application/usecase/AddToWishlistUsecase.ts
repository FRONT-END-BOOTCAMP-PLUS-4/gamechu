import { WishListRepository } from "../../domain/repositories/WishListRepository";

export class AddToWishlistUsecase {
    constructor(private readonly wishlistRepo: WishListRepository) {}

    async execute(memberId: string, gameId: number): Promise<void> {
        const alreadyExists = await this.wishlistRepo.isWished(
            memberId,
            gameId
        );
        if (alreadyExists) {
            throw new Error("이미 위시리스트에 존재합니다.");
        }

        await this.wishlistRepo.addToWishlist(memberId, gameId);
    }
}
