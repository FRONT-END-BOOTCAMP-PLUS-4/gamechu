import { Wishlist } from "@/prisma/generated";
import { WishlistFilter } from "../filters/WishlistFilter";

export type CreateWishlistInput = Omit<Wishlist, "id">;

export interface WishListRepository {
    // findAll(memberId: string): Promise<Wishlist[]>; // 위시리스트 전체 조회
    // count(memberId: string): Promise<number>; // 위시리스트 개수
    findById(memberId: string, gameId: number): Promise<Wishlist | null>; // 단건 조회
    save(wishlist: CreateWishlistInput): Promise<Wishlist>; // 위시리스트 저장
    deleteById(id: number): Promise<void>; // ID로 삭제

    findAll(filter: WishlistFilter): Promise<Wishlist[]>; // 필터링된 위시리스트 조회
    count(filter: WishlistFilter): Promise<number>; // 필터링된 위시리스트 개수
}
