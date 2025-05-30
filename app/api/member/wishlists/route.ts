// app/api/member/wishlists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";

import { PrismaWishListRepository } from "@/backend/wishlist/infra/repositories/prisma/PrismaWishListRepository";
import { GetWishlistGamesUsecase } from "@/backend/wishlist/application/usecase/GetWishlistGamesUsecase";
import { AddToWishlistUsecase } from "@/backend/wishlist/application/usecase/AddToWishlistUsecase";
import { RemoveFromWishlistUsecase } from "@/backend/wishlist/application/usecase/RemoveFromWishlistUsecase";

const repo = new PrismaWishListRepository();

// ✅ GET: 위시리스트 조회
export async function GET() {
    const memberId = await getAuthUserId();
    if (!memberId)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const usecase = new GetWishlistGamesUsecase(repo);

    try {
        const result = await usecase.execute(memberId);
        return NextResponse.json(result);
    } catch (error) {
        console.error("[WISHLIST_FETCH_ERROR]", error);
        return NextResponse.json(
            { message: "위시리스트 조회 실패" },
            { status: 500 }
        );
    }
}

// ✅ POST: 위시리스트에 게임 추가
export async function POST(req: NextRequest) {
    const memberId = await getAuthUserId();
    if (!memberId)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { gameId } = await req.json();
    const usecase = new AddToWishlistUsecase(repo);

    try {
        await usecase.execute(memberId, gameId);
        return NextResponse.json({ message: "위시리스트에 추가되었습니다." });
    } catch (error) {
        console.error("[WISHLIST_ADD_ERROR]", error);
        return NextResponse.json(
            { message: "위시리스트 등록 실패" },
            { status: 400 }
        );
    }
}

// ✅ DELETE: 위시리스트에서 게임 삭제
// TODO: wishlists/[id]/route.ts로 이주시키기
export async function DELETE(req: NextRequest) {
    const memberId = await getAuthUserId();
    if (!memberId)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { gameId } = await req.json();
    const usecase = new RemoveFromWishlistUsecase(repo);

    try {
        await usecase.execute(memberId, gameId);
        return NextResponse.json({ message: "삭제 완료" });
    } catch (error) {
        console.error("[WISHLIST__ERROR]", error);
        return NextResponse.json(
            { message: "위시리스트 삭제 실패" },
            { status: 400 }
        );
    }
}
