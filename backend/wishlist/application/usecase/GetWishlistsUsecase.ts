import { WishListRepository } from "../../domain/repositories/WishListRepository";
import { GameRepository } from "../../../game/domain/repositories/GameRepository";
import { ReviewRepository } from "../../../review/domain/repositories/ReviewRepository";
import { GetWishListDto } from "./dto/GetWishListDto";
import { WishlistsDto } from "./dto/WishlistsDto";

const ITEMS_PER_PAGE = 4;// 페이지당 아이템 수

export class GetWishlistsUsecase {
  constructor(
    private readonly wishlistRepo: WishListRepository,
    private readonly gameRepo: GameRepository,
    private readonly reviewRepo: ReviewRepository
  ) {}

  async execute(memberId: string, page: number): Promise<WishlistsDto> {
    const totalCount = await this.wishlistRepo.count(memberId);// 총 위시리스트 개수
    const allWishlists = await this.wishlistRepo.findAll(memberId);// 모든 위시리스트 조회

    const start = (page - 1) * ITEMS_PER_PAGE;// 페이지네이션 시작 인덱스
    const end = start + ITEMS_PER_PAGE; // 페이지네이션 끝 인덱스
    const paginated = allWishlists.slice(start, end);// 현재 페이지에 해당하는 위시리스트만 가져오기

    // 위시리스트 DTO 생성
    const wishlistDtos = await Promise.all(
      paginated.map(async (wishlist) => {
        const game = await this.gameRepo.findDetailById(wishlist.gameId);
        const reviews = await this.reviewRepo.findByGameId(wishlist.gameId);
        const expertRating = (await this.gameRepo.getAverageRatingByExpert(wishlist.gameId)) ?? 0;

        return new GetWishListDto(
          game.id,
          game.title,
          game.developer ?? "알 수 없음",
          game.thumbnail ?? "/images/default-game.png",
          game.platforms?.[0] ?? "기타",
          expertRating,
          reviews.length
        );
      })
    );

    // 페이지네이션 정보 생성
    const endPage = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const pages = Array.from({ length: endPage }, (_, i) => i + 1);

    return new WishlistsDto(wishlistDtos, page, pages, endPage, totalCount);// WishlistsDto 생성
  }
}
