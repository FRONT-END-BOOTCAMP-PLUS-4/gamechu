// backend/wishlist/domain/repositories/WishListRepository.ts
import { GetWishListGameDto } from "../../application/usecase/dto/GetWishListGameDto";

export interface WishListRepository {
  getGamesInWishlist(memberId: string): Promise<GetWishListGameDto[]>;
}