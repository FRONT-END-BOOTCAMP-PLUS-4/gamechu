// backend/wishlist/infra/repositories/prisma/PrismaWishListRepository.ts
import { PrismaClient } from "@/prisma/generated";
import { WishListRepository } from "../../../domain/repositories/WishListRepository";
import { GetWishListGameDto } from "../../../application/usecase/dto/GetWishListGameDto";

const prisma = new PrismaClient();

export class PrismaWishListRepository implements WishListRepository {
  async getGamesInWishlist(memberId: string): Promise<GetWishListGameDto[]> {
    const wishlists = await prisma.wishlist.findMany({
      where: { memberId },
      include: {
        game: {
          include: {
            gamePlatforms: {
              include: { platform: true },
              take: 1,
            },
          },
        },
      },
    });

    return wishlists.map(({ game }) => {
      const platform = game.gamePlatforms[0]?.platform.name ?? "기타";

      return new GetWishListGameDto(
        game.id,
        game.title,
        game.developer ?? "알 수 없음",
        game.thumbnail ?? "/images/default-game.png",
        platform
      );
    });
  }

  async isWished(memberId: string, gameId: number): Promise<boolean> {
    const existing = await prisma.wishlist.findFirst({
      where: { memberId, gameId },
    });
    return !!existing;
  }

  async addToWishlist(memberId: string, gameId: number): Promise<void> {
    await prisma.wishlist.create({
      data: { memberId, gameId },
    });
  }

  async removeFromWishlist(memberId: string, gameId: number): Promise<void> {
    await prisma.wishlist.deleteMany({
      where: { memberId, gameId },
    });
  }
}
