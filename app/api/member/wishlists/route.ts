// app/api/member/wishlists/route.ts
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server"
import { PrismaWishListRepository } from "@/backend/wishlist/infra/repositories/prisma/PrismaWishListRepository";
import { GetWishlistGamesUsecase } from "@/backend/wishlist/application/usecase/GetWishlistGamesUsecase";

const usecase = new GetWishlistGamesUsecase(new PrismaWishListRepository());

export async function GET() {
  const memberId = await getAuthUserId();
  if (!memberId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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
