import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { GetMemberProfileUsecase } from "@/backend/member/application/usecase/GetMemberProfileUsecase";
import { UpdateMemberProfileUseCase } from "@/backend/member/application/usecase/UpdateMemberProfileUseCase";
import {
    UpdateProfileRequestDto,
    UpdateProfileSchema,
} from "@/backend/member/application/usecase/dto/UpdateProfileRequestDto";
import { validate } from "@/utils/Validation";
import { errorResponse } from "@/utils/ApiResponse";
import logger from "@/lib/Logger";

export async function GET() {
    const session = await getServerSession(authOptions);
    const memberId = session?.user?.id;
    const log = logger.child({ route: "/api/member/profile", method: "GET" });
    try {
        if (!memberId) return errorResponse("Unauthorized", 401);

        const getUsecase = new GetMemberProfileUsecase(
            new PrismaMemberRepository()
        );
        const profile = await getUsecase.execute(memberId);
        if (!profile) return errorResponse("Not found", 404);

        return NextResponse.json(profile);
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "프로필 조회 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    const memberId = session?.user?.id;
    const log = logger.child({ route: "/api/member/profile", method: "PUT" });
    try {
        if (!memberId) return errorResponse("Unauthorized", 401);

        const body = await req.json();

        const validated = validate(UpdateProfileSchema, body);
        if (!validated.success) return validated.response;

        const updateUsecase = new UpdateMemberProfileUseCase(
            new PrismaMemberRepository()
        );

        const dto = new UpdateProfileRequestDto({
            memberId,
            nickname: validated.data.nickname,
            isMale: validated.data.isMale,
            birthDate: validated.data.birthDate,
            imageUrl: validated.data.imageUrl,
        });

        await updateUsecase.execute(dto);

        return NextResponse.json({
            message: "프로필이 성공적으로 수정되었습니다.",
        });
    } catch (err: unknown) {
        log.error({ userId: memberId, err }, "프로필 수정 실패");
        const message = err instanceof Error ? err.message : "프로필 수정 실패";
        return errorResponse(message, 500);
    }
}
