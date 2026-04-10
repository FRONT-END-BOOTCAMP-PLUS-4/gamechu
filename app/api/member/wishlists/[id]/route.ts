// app/api/member/wishlists/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaWishListRepository } from "@/backend/wishlist/infra/repositories/prisma/PrismaWishListRepository";
import { DeleteWishlistUsecase } from "@/backend/wishlist/application/usecase/DeleteWishlistUsecase";
import { DeleteWishlistDto } from "@/backend/wishlist/application/usecase/dto/DeleteWishlistDto";
import { validate, IdSchema } from "@/utils/Validation";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";

type RequestParams = {
    params: Promise<{
        id: string;
    }>;
};

// DELETE 요청 핸들러
export async function DELETE(req: NextRequest, { params }: RequestParams) {
    const memberId = await getAuthUserId();
    const log = logger.child({ route: "/api/member/wishlists/[id]", method: "DELETE" });
    try {
        if (!memberId) {
            return errorResponse("Unauthorized", 401);
        }

        const { id } = await params; // [id] is gameId, not wishlist PK
        const parsed = validate(IdSchema, id);
        if (!parsed.success) return parsed.response;
        const gameId = parsed.data;

        const wishlistRepo = new PrismaWishListRepository();
        const wishlist = await wishlistRepo.findById(memberId, gameId);
        if (!wishlist) return errorResponse("위시리스트를 찾을 수 없습니다.", 404);

        const usecase = new DeleteWishlistUsecase(wishlistRepo);
        const deleteWishlistDto = new DeleteWishlistDto(wishlist.id);

        await usecase.execute(deleteWishlistDto);

        return NextResponse.json({ message: "삭제 완료" }, { status: 200 });
    } catch (error) {
        log.error({ userId: memberId, err: error }, "위시리스트 삭제 실패");
        const message = error instanceof Error ? error.message : "삭제 실패";
        return errorResponse(message, 500);
    }
}
