import { WishListRepository } from "../../domain/repositories/WishListRepository";
import { GetWishlistDto } from "./dto/GetWishlistDto";
import { CreateWishlistInput } from "../../domain/repositories/WishListRepository";

export class CreateWishlistUsecase {
    constructor(private readonly wishlistRepo: WishListRepository) {}

    async execute(getWishlistDto: GetWishlistDto): Promise<number> {
        const memberID = getWishlistDto.memberId;
        const gameID = getWishlistDto.gameId;

        const alreadyExists = await this.wishlistRepo.findById(
            memberID,
            gameID
        );
        if (alreadyExists) {
            throw new Error("이미 위시리스트에 존재합니다.");
        }

        const wishlist: CreateWishlistInput = {
            memberId: memberID,
            gameId: gameID,
        };

        const newWishlist = await this.wishlistRepo.save(wishlist);
        return newWishlist.id;
    }
}
