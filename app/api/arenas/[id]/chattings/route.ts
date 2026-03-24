import { GetChattingDto } from "@/backend/chatting/application/usecase/dto/GetChattingDto";
import { GetChattingUsecase } from "@/backend/chatting/application/usecase/GetChattingUsecase";
import { PrismaChattingRepository } from "@/backend/chatting/infra/repositories/prisma/PrismaChattingRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { IdSchema, validate } from "@/utils/validation";
import { NextResponse } from "next/server";

type RequestParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(req: Request, { params }: RequestParams) {
    const { id } = await params;
    const memberId: string | null = await getAuthUserId();

    const idValidation = validate(IdSchema, id);
    if (!idValidation.success) return idValidation.response;
    const arenaId = idValidation.data;

    try {
        const chattingRepository = new PrismaChattingRepository();
        const getChattingUsecase = new GetChattingUsecase(chattingRepository);
        const getChattingDto = new GetChattingDto(arenaId, memberId);

        const result = await getChattingUsecase.execute(getChattingDto);

        return NextResponse.json(result);
    } catch (error) {
        console.error("채팅 조회 중 오류 발생:", error);
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
