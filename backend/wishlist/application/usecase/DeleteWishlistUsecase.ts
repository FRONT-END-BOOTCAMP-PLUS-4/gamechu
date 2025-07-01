import { WishListRepository } from "../../domain/repositories/WishListRepository";

export class DeleteWishlistUsecase {
    constructor(private readonly wishlistRepo: WishListRepository) {}

    async execute(wishlistId: number): Promise<void> {
        await this.wishlistRepo.deleteById(wishlistId);
    }
}
