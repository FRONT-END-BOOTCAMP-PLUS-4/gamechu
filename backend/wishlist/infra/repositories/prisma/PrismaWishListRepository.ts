// backend/wishlist/infra/repositories/prisma/PrismaWishListRepository.ts
import { PrismaClient, Wishlist } from "@/prisma/generated";
import { WishListRepository } from "../../../domain/repositories/WishListRepository";

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
}
