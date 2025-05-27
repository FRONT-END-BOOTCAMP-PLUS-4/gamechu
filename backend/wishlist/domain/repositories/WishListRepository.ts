// backend/wishlist/domain/repositories/WishListRepository.ts
import { GetWishListGameDto } from "../../application/usecase/dto/GetWishListGameDto";

export interface WishListRepository {
  getGamesInWishlist(memberId: string): Promise<GetWishListGameDto[]>;
  isWished(memberId: string, gameId: number): Promise<boolean>;
  addToWishlist(memberId: string, gameId: number): Promise<void>;
  removeFromWishlist(memberId: string, gameId: number): Promise<void>;
}