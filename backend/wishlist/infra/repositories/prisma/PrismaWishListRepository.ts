// backend/wishlist/infra/repositories/prisma/PrismaWishListRepository.ts
import { PrismaClient, Wishlist } from "@/prisma/generated";
import { WishListRepository } from "../../../domain/repositories/WishListRepository";
// import { WishlistFilter } from "../../../domain/filters/WishlistFilter"; // Uncomment if needed
// import { Prisma } from "@prisma/generated"; // Uncomment if needed for advanced filtering

export class PrismaWishListRepository implements WishListRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async findAll(memberId: string): Promise<Wishlist[]> {
        return this.prisma.wishlist.findMany({
            where: { memberId },
            include: {
                game: {
                    include: {
                        gamePlatforms: {
                            include: { platform: true },
                            take: 1,
                        },
                        reviews: {
                            include: { member: true },
                        },
                    },
                },
                member: true,
            },
        });
    }

    async count(memberId: string): Promise<number> {
        return this.prisma.wishlist.count({
            where: { memberId },
        });
    }

    async findById(memberId: string, gameId: number): Promise<Wishlist | null> {
        return this.prisma.wishlist.findFirst({
            where: { memberId, gameId },
            include: {
                game: true,
                member: true,
            },
        });
    }

    async save(memberId: string, gameId: number): Promise<Wishlist> {
        return this.prisma.wishlist.create({
            data: { memberId, gameId },
            include: {
                game: true,
                member: true,
            },
        });
    }

    async deleteById(id: number): Promise<void> {
        await this.prisma.wishlist.delete({
            where: { id },
        });
    }

    // private getWhereClause(filter: WishlistFilter): Prisma.WishlistWhereInput {
    //     return {
    //         memberId: filter.memberId, // ✅ 무조건 포함 (필수값)
    //     };
    // }

    // async findAll(filter: WishlistFilter): Promise<Wishlist[]> {
    //     const { sortField, ascending, offset, limit } = filter;

    //     return this.prisma.wishlist.findMany({
    //         where: this.getWhereClause(filter),
    //         skip: offset,
    //         take: limit,
    //         orderBy: {
    //             [sortField]: ascending ? "asc" : "desc",
    //         },
    //         include: {
    //             game: {
    //                 include: {
    //                     gamePlatforms: {
    //                         include: { platform: true },
    //                         take: 1,
    //                     },
    //                     reviews: {
    //                         include: { member: true },
    //                     },
    //                 },
    //             },
    //             member: true,
    //         },
    //     });
    // }

    // async count(filter: WishlistFilter): Promise<number> {
    //     return this.prisma.wishlist.count({
    //         where: this.getWhereClause(filter),
    //     });
    // }
}
