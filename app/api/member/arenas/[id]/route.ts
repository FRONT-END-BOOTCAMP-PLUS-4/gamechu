import { DeleteArenaUsecase } from "@/backend/arena/application/usecase/DeleteArenaUsecase";
import { UpdateArenaDto } from "@/backend/arena/application/usecase/dto/UpdateArenaDto";
import { UpdateArenaUsecase } from "@/backend/arena/application/usecase/UpdateArenaUsecase";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { Arena } from "@/prisma/generated";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { NextResponse } from "next/server";

type RequestParams = {
    params: Promise<{
        id: string;
    }>;
};

// 해당 API는 유저가 투기장 정보를 변경할 경우 (투기장 참여, 설명, 시작 날짜 변경) 사용합니다!
export async function PATCH(request: Request, { params }: RequestParams) {
    try {
        const { id } = await params;
        const arenaId: number = Number(id);

        // body validation
        const body = await request.json();
        if (!body.description && !body.challengerId && !body.startDate) {
            return NextResponse.json(
                { error: "변경된 내용을 찾을 수 없습니다." },
                { status: 400 }
            );
        }

        // member validation
        const memberId: string | null = await getAuthUserId();
        if (!memberId) {
            return NextResponse.json(
                { error: "투기장 변경 권한이 없습니다." },
                { status: 401 }
            );
        }

        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const updateArenaUsecase: UpdateArenaUsecase = new UpdateArenaUsecase(
            arenaRepository
        );
        const updateArenaDto: UpdateArenaDto = {
            id: arenaId,
            challengerId: body.challengerId,
            description: body.description,
            startDate: body.startDate,
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

// TODO: 투기장 참가자 간 상호 동의하에 삭제하는 기능을 추가할 시, 해당 API를 사용
export async function DELETE(request: Request, { params }: RequestParams) {
    try {
        const { id } = await params;
        const arenaId: number = Number(id);

        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const deleteArenaUsecase: DeleteArenaUsecase = new DeleteArenaUsecase(
            arenaRepository
        );

        // arena validation
        const arena: Arena | null = await arenaRepository.findById(arenaId);

        if (!arena) {
            return NextResponse.json(
                { error: "투기장이 존재하지 않습니다." },
                { status: 404 }
            );
        }

        // member validation
        const memberId: string | null = await getAuthUserId();
        if (
            !memberId ||
            (arena.creatorId !== memberId && arena.challengerId !== memberId)
        ) {
            return NextResponse.json(
                { error: "투기장 삭제 권한이 없습니다." },
                { status: 401 }
            );
        }

        // execute usecase
        await deleteArenaUsecase.execute(arenaId);
        return NextResponse.json(
            { message: "투기장 삭제 성공" },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("Error deleting arenas:", error);
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
