import { WishListRepository } from "../../domain/repositories/WishListRepository";
import { GameRepository } from "../../../game/domain/repositories/GameRepository";
import { ReviewRepository } from "../../../review/domain/repositories/ReviewRepository";
import { WishlistDto } from "./dto/WishlistDto";
import { GetWishlistsDto } from "./dto/GetWishlistsDto";
import { GetWishlistsResultDto } from "./dto/GetWishlistsResultDto";
import { WishlistFilter } from "../../domain/filters/WishlistFilter";

const ITEMS_PER_PAGE = 4; // 페이지당 아이템 수

export class GetWishlistsUsecase {
    constructor(
        private readonly wishlistRepo: WishListRepository,
        private readonly gameRepo: GameRepository,
        private readonly reviewRepo: ReviewRepository
    ) {}

    // async execute(memberId: string, page: number): Promise<WishlistsDto> {
    //     const totalCount = await this.wishlistRepo.count(memberId); // 총 위시리스트 개수
    //     const allWishlists = await this.wishlistRepo.findAll(memberId); // 모든 위시리스트 조회

    //     const start = (page - 1) * ITEMS_PER_PAGE; // 페이지네이션 시작 인덱스
    //     const end = start + ITEMS_PER_PAGE; // 페이지네이션 끝 인덱스
    //     const paginated = allWishlists.slice(start, end); // 현재 페이지에 해당하는 위시리스트만 가져오기

    //     // 위시리스트 DTO 생성
    //     const wishlistDtos = await Promise.all(
    //         paginated.map(async (wishlist) => {
    //             const game = await this.gameRepo.findDetailById(
    //                 wishlist.gameId
    //             );
    //             const reviews = await this.reviewRepo.findByGameId(
    //                 wishlist.gameId
    //             );
    //             const expertRating =
    //                 (await this.gameRepo.getAverageRatingByExpert(
    //                     wishlist.gameId
    //                 )) ?? 0;

    //             return new WishlistDto(
    //                 game.id,
    //                 game.title,
    //                 game.developer ?? "알 수 없음",
    //                 game.thumbnail ?? "/images/default-game.png",
    //                 game.platforms?.[0] ?? "기타",
    //                 expertRating,
    //                 reviews.length
    //             );
    //         })
    //     );

    //     // 페이지네이션 정보 생성
    //     const endPage = Math.ceil(totalCount / ITEMS_PER_PAGE);
    //     const pages = Array.from({ length: endPage }, (_, i) => i + 1);

    //     return new WishlistsDto(wishlistDtos, page, pages, endPage, totalCount); // WishlistsDto 생성
    // }

    // 아래 코드는 필터링 기능이 필요할 때 사용할 수 있습니다.

    async execute(
        getWishlistsDto: GetWishlistsDto
    ): Promise<GetWishlistsResultDto> {
        const { memberId, page } = getWishlistsDto;
        const offset = (page - 1) * ITEMS_PER_PAGE;

        // ✅ 필터 객체 생성
        const filter = new WishlistFilter(
            memberId,
            "id", // 기본 정렬 필드
            false, // 최신순
            offset,
            ITEMS_PER_PAGE
        );

        const totalCount = await this.wishlistRepo.count(filter); // ✅ 필터 기반 count
        const paginated = await this.wishlistRepo.findAll(filter); // ✅ 필터 기반 findAll

        // DTO 변환
        const wishlistDtos = await Promise.all(
            paginated.map(async (wishlist) => {
                const game = await this.gameRepo.findById(wishlist.gameId);
                const reviews = await this.reviewRepo.findByGameId(
                    wishlist.gameId
                );
                const expertRating =
                    (await this.gameRepo.getAverageRatingByExpert(
                        wishlist.gameId
                    )) ?? 0;

                return new WishlistDto(
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

        // 페이지네이션 정보
        const endPage = Math.ceil(totalCount / ITEMS_PER_PAGE);
        const pages = Array.from({ length: endPage }, (_, i) => i + 1);

        return new GetWishlistsResultDto(
            wishlistDtos,
            page,
            pages,
            endPage,
            totalCount
        );
    }
}
