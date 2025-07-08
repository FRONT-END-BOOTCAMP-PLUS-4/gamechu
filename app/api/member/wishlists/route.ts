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

// ✅ repository instance 생성
const wishlistRepo = new PrismaWishListRepository();
const gameRepo = new GamePrismaRepository();
const reviewRepo = new PrismaReviewRepository();

export async function GET(req: NextRequest) {
    const memberId = await getAuthUserId();
    if (!memberId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const gameIdParam = searchParams.get("gameId");
    const pageParam = searchParams.get("page");
    const page = Math.max(Number(pageParam) || 1, 1); // 기본값 1, 0 이하 방지

    // ✅ 단일 조회 (isWish 체크)
    if (gameIdParam !== null) {
        const gameId = Number(gameIdParam);
        if (isNaN(gameId)) {
            return NextResponse.json(
                { message: "Invalid gameId" },
                { status: 400 }
            );
        }

        const usecase = new GetWishlistUsecase(wishlistRepo);
        const getWishlistDto = new GetWishlistDto(gameId, memberId);
        try {
            const result = await usecase.execute(getWishlistDto);
            return NextResponse.json(result);
        } catch (err) {
            console.error("[WISHLIST_SINGLE_FETCH_ERROR]", err);
            return NextResponse.json(
                { message: "단일 위시리스트 조회 실패" },
                { status: 500 }
            );
        }
    }

    // ✅ 전체 목록 + 페이지네이션
    const usecase = new GetWishlistsUsecase(wishlistRepo, gameRepo, reviewRepo);
    const getWishlistsDto = new GetWishlistsDto(memberId, page);
    try {
        const result = await usecase.execute(getWishlistsDto);
        return NextResponse.json(result); // WishListPageDto 형식 반환
    } catch (error) {
        console.error("[WISHLIST_FETCH_ERROR]", error);
        return NextResponse.json(
            { message: "위시리스트 목록 조회 실패" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const memberId = await getAuthUserId();
    if (!memberId)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const { gameId } = await req.json();
        const usecase = new CreateWishlistUsecase(wishlistRepo);
        const getWishlistDto = new GetWishlistDto(gameId, memberId);
        const wishlistId = await usecase.execute(getWishlistDto);

        // ✅ 성공적으로 등록되었으면 명시적으로 200 반환
        return NextResponse.json(
            {
                message: "위시리스트에 추가되었습니다.",
                wishlistId,
            },
            { status: 200 }
        ); // 👈 꼭 명시하세요!
    } catch (error) {
        console.error("[WISHLIST_ADD_ERROR]", error);

        // 👇 실제로 에러가 아닐 수도 있으므로 500 아님을 구분
        return NextResponse.json(
            { message: "위시리스트 등록 실패" },
            { status: 400 }
        );
    }
}
