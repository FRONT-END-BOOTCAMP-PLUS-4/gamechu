import { WishListRepository } from "../../domain/repositories/WishListRepository";
import { DeleteWishlistDto } from "./dto/DeleteWishlistDto";

export class DeleteWishlistUsecase {
    constructor(private readonly wishlistRepo: WishListRepository) {}

    async execute(deleteWishlistDto: DeleteWishlistDto): Promise<void> {
        const wishlistId = deleteWishlistDto.wishlistId;
        await this.wishlistRepo.deleteById(wishlistId);
    }
}
