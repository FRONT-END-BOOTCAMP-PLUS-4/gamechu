import { WishListRepository } from "../../domain/repositories/WishListRepository";

export class CreateWishlistUsecase {
    constructor(private readonly wishlistRepo: WishListRepository) {}

    async execute(memberId: string, gameId: number): Promise<number> {
        const alreadyExists = await this.wishlistRepo.findById(
            memberId,
            gameId
        );
        if (alreadyExists) {
            throw new Error("이미 위시리스트에 존재합니다.");
        }

        const wishlist = await this.wishlistRepo.save(memberId, gameId);
        return wishlist.id;
    }
}
