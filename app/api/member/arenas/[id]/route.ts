import { DeleteArenaUsecase } from "@/backend/arena/application/usecase/DeleteArenaUsecase";
import { UpdateArenaDto } from "@/backend/arena/application/usecase/dto/UpdateArenaDto";
import { UpdateArenaSchema } from "@/backend/arena/application/usecase/dto/UpdateArenaDto";
import { UpdateArenaUsecase } from "@/backend/arena/application/usecase/UpdateArenaUsecase";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { Arena } from "@/prisma/generated";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { validate, IdSchema } from "@/utils/Validation";
import { errorResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";
import logger from "@/lib/Logger";

type RequestParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(request: Request, { params }: RequestParams) {
    try {
        const { id } = await params;
        const idValidated = validate(IdSchema, id);
        if (!idValidated.success) return idValidated.response;
        const arenaId = idValidated.data;

        // member validation — check auth before parsing body
        const memberId: string | null = await getAuthUserId();
        if (!memberId) return errorResponse("로그인이 필요합니다.", 401);

        // body validation
        const body = await request.json();
        const validated = validate(UpdateArenaSchema, body);
        if (!validated.success) return validated.response;

        const arenaRepository: ArenaRepository = new PrismaArenaRepository();

        // ownership check
        const arena = await arenaRepository.findById(arenaId);
        if (!arena) return errorResponse("투기장이 존재하지 않습니다.", 404);
        if (arena.creatorId !== memberId && arena.challengerId !== memberId) {
            return errorResponse("투기장 변경 권한이 없습니다.", 403);
        }

        const updateArenaUsecase: UpdateArenaUsecase = new UpdateArenaUsecase(
            arenaRepository
        );
        const updateArenaDto: UpdateArenaDto = {
            id: arenaId,
            description: validated.data.description,
            startDate: validated.data.startDate
                ? new Date(validated.data.startDate)
                : undefined,
        };

        await updateArenaUsecase.execute(updateArenaDto);

        return NextResponse.json(
            { message: "투기장 수정 성공" },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "투기장 수정 실패" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: RequestParams) {
    const log = logger.child({
        route: "/api/member/arenas/[id]",
        method: "DELETE",
    });
    try {
        const { id } = await params;
        const idValidated = validate(IdSchema, id);
        if (!idValidated.success) return idValidated.response;
        const arenaId = idValidated.data;

        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const deleteArenaUsecase: DeleteArenaUsecase = new DeleteArenaUsecase(
            arenaRepository
        );

        // arena validation
        const arena: Arena | null = await arenaRepository.findById(arenaId);

        if (!arena) {
            return NextResponse.json(
                { message: "투기장이 존재하지 않습니다." },
                { status: 404 }
            );
        }

        // member validation
        const memberId: string | null = await getAuthUserId();
        if (!memberId) {
            return NextResponse.json(
                { message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }
        if (arena.creatorId !== memberId && arena.challengerId !== memberId) {
            return NextResponse.json(
                { message: "투기장 삭제 권한이 없습니다." },
                { status: 403 }
            );
        }

        // execute usecase
        await deleteArenaUsecase.execute(arenaId);
        return NextResponse.json(
            { message: "투기장 삭제 성공" },
            { status: 200 }
        );
    } catch (error: unknown) {
        log.error({ err: error }, "아레나 삭제 실패");
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "투기장 삭제 실패" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
