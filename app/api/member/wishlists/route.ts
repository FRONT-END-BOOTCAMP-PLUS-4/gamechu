import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaWishListRepository } from "@/backend/wishlist/infra/repositories/prisma/PrismaWishListRepository";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { GetWishlistUsecase } from "@/backend/wishlist/application/usecase/GetWishlistUsecase";
import { GetWishlistsUsecase } from "@/backend/wishlist/application/usecase/GetWishlistsUsecase";
import { CreateWishlistUsecase } from "@/backend/wishlist/application/usecase/CreateWishlistUsecase";
import { GetWishlistDto } from "@/backend/wishlist/application/usecase/dto/GetWishlistDto";
import { GetWishlistsDto } from "@/backend/wishlist/application/usecase/dto/GetWishlistsDto";
import { errorResponse } from "@/utils/apiResponse";

export async function GET(req: NextRequest) {
    try {
        const memberId = await getAuthUserId();
        if (!memberId) return errorResponse("Unauthorized", 401);

        const { searchParams } = new URL(req.url);
        const gameIdParam = searchParams.get("gameId");
        const pageParam = searchParams.get("page");
        const page = Math.max(Number(pageParam) || 1, 1);

        if (gameIdParam !== null) {
            const gameId = Number(gameIdParam);
            if (isNaN(gameId)) return errorResponse("Invalid gameId", 400);

            const wishlistRepo = new PrismaWishListRepository();
            const usecase = new GetWishlistUsecase(wishlistRepo);
            const getWishlistDto = new GetWishlistDto(gameId, memberId);
            const result = await usecase.execute(getWishlistDto);
            return NextResponse.json(result);
        }

        const wishlistRepo = new PrismaWishListRepository();
        const gameRepo = new GamePrismaRepository();
        const reviewRepo = new PrismaReviewRepository();
        const usecase = new GetWishlistsUsecase(wishlistRepo, gameRepo, reviewRepo);
        const getWishlistsDto = new GetWishlistsDto(memberId, page);
        const result = await usecase.execute(getWishlistsDto);
        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("[wishlists] GET error:", error);
        const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const memberId = await getAuthUserId();
        if (!memberId) return errorResponse("Unauthorized", 401);

        const { gameId } = await req.json();
        const wishlistRepo = new PrismaWishListRepository();
        const usecase = new CreateWishlistUsecase(wishlistRepo);
        const getWishlistDto = new GetWishlistDto(gameId, memberId);
        const wishlistId = await usecase.execute(getWishlistDto);

        return NextResponse.json(
            { message: "위시리스트에 추가되었습니다.", wishlistId },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("[wishlists] POST error:", error);
        const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 400);
    }
}
