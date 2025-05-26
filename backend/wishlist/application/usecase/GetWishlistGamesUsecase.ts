// backend/wishlist/application/usecase/GetWishlistGamesUsecase.ts
import { WishListRepository } from "../../domain/repositories/WishListRepository";
import { GetWishListGameDto } from "./dto/GetWishListGameDto";

export class GetWishlistGamesUsecase {
  constructor(private readonly repo: WishListRepository) {}

  async execute(memberId: string): Promise<GetWishListGameDto[]> {
    return this.repo.getGamesInWishlist(memberId);
  }
}