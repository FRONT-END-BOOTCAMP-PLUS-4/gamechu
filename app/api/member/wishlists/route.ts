import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaWishListRepository } from "@/backend/wishlist/infra/repositories/prisma/PrismaWishListRepository";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { GetWishlistUsecase } from "@/backend/wishlist/application/usecase/GetWishlistUsecase";
import { GetWishlistsUsecase } from "@/backend/wishlist/application/usecase/GetWishlistsUsecase";
import { CreateWishlistUsecase } from "@/backend/wishlist/application/usecase/CreateWishlistUsecase";
import { GetWishlistDto, WishlistBodySchema } from "@/backend/wishlist/application/usecase/dto/GetWishlistDto";
import { GetWishlistsDto } from "@/backend/wishlist/application/usecase/dto/GetWishlistsDto";
import { validate } from "@/utils/validation";

export async function GET(req: NextRequest) {
    const memberId = await getAuthUserId();
    if (!memberId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const gameIdParam = searchParams.get("gameId");
    const pageParam = searchParams.get("page");
    const page = Math.max(Number(pageParam) || 1, 1);

    if (gameIdParam !== null) {
        const gameId = Number(gameIdParam);
        if (isNaN(gameId)) {
            return NextResponse.json({ message: "Invalid gameId" }, { status: 400 });
        }

        const wishlistRepo = new PrismaWishListRepository();
        const usecase = new GetWishlistUsecase(wishlistRepo);
        const getWishlistDto = new GetWishlistDto(gameId, memberId);
        try {
            const result = await usecase.execute(getWishlistDto);
            return NextResponse.json(result);
        } catch (err) {
            console.error("[WISHLIST_SINGLE_FETCH_ERROR]", err);
            return NextResponse.json({ message: "단일 위시리스트 조회 실패" }, { status: 500 });
        }
    }

    // ✅ 전체 목록 + 페이지네이션
    const wishlistRepo = new PrismaWishListRepository();
    const gameRepo = new GamePrismaRepository();
    const reviewRepo = new PrismaReviewRepository();
    const usecase = new GetWishlistsUsecase(wishlistRepo, gameRepo, reviewRepo);
    const getWishlistsDto = new GetWishlistsDto(memberId, page);
    try {
        const result = await usecase.execute(getWishlistsDto);
        return NextResponse.json(result);
    } catch (error) {
        console.error("[WISHLIST_FETCH_ERROR]", error);
        return NextResponse.json({ message: "위시리스트 목록 조회 실패" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const memberId = await getAuthUserId();
    if (!memberId)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const parsed = validate(WishlistBodySchema, body);
        if (!parsed.success) return parsed.response;

        const { gameId } = parsed.data;
        const wishlistRepo = new PrismaWishListRepository();
        const usecase = new CreateWishlistUsecase(wishlistRepo);
        const getWishlistDto = new GetWishlistDto(gameId, memberId);
        const wishlistId = await usecase.execute(getWishlistDto);

        return NextResponse.json(
            { message: "위시리스트에 추가되었습니다.", wishlistId },
            { status: 200 }
        );
    } catch (error) {
        console.error("[WISHLIST_ADD_ERROR]", error);

        return NextResponse.json(
            { message: "위시리스트 등록 실패" },
            { status: 400 }
        );
    }
}
