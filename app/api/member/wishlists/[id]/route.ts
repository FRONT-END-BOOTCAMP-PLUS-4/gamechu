// app/api/member/wishlists/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaWishListRepository } from "@/backend/wishlist/infra/repositories/prisma/PrismaWishListRepository";
import { DeleteWishlistUsecase } from "@/backend/wishlist/application/usecase/DeleteWishlistUsecase";
import { DeleteWishlistDto } from "@/backend/wishlist/application/usecase/dto/DeleteWishlistDto";

type RequestParams = {
    params: Promise<{
        id: string;
    }>;
};

// DELETE 요청 핸들러
export async function DELETE(req: NextRequest, { params }: RequestParams) {
    try {
        const memberId = await getAuthUserId();
        if (!memberId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params; // 폴더 이름이 [id]일 경우
        const wishlistId = Number(id);

        if (isNaN(wishlistId)) {
            return NextResponse.json(
                { message: "Invalid game ID" },
                { status: 400 }
            );
        }

        const wishlistRepo = new PrismaWishListRepository();
        const usecase = new DeleteWishlistUsecase(wishlistRepo);

        const deleteWishlistDto = new DeleteWishlistDto(wishlistId);

        await usecase.execute(deleteWishlistDto);

        return NextResponse.json({ message: "삭제 완료" }, { status: 200 });
    } catch (error) {
        console.error("[WISHLIST_DELETE_ERROR]", error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "삭제 실패" },
            { status: 400 }
        );
    }
}
