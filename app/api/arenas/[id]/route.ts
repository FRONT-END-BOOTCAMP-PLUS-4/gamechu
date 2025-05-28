import { DeleteArenaUsecase } from "@/backend/arena/application/usecase/DeleteArenaUsecase";
import { GetArenaDetailUsecase } from "@/backend/arena/application/usecase/GetArenaDetailUsecase";
import { UpdateArenaStatusUsecase } from "@/backend/arena/application/usecase/UpdateArenaStatusUsecase";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { NextRequest, NextResponse } from "next/server";

type RequestParams = {
    params: {
        id: number;
    };
};

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const arenaId = Number((await context.params).id);

    if (isNaN(arenaId)) {
        return NextResponse.json({ error: "Invalid arenaId" }, { status: 400 });
    }

    const usecase = new GetArenaDetailUsecase(new PrismaArenaRepository());

    try {
        const result = await usecase.execute(arenaId);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: `Failed to fetch participants: ${error}` },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { status, challengerId } = await req.json();
    const arenaId = Number((await context.params).id);

    const ArenaRepository = new PrismaArenaRepository();
    const updateArenaStatusUsecase = new UpdateArenaStatusUsecase(
        ArenaRepository
    );

    try {
        await updateArenaStatusUsecase.execute(arenaId, status, challengerId); // challengerId 없으면 undefined
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        let errorMessage = "에러 발생";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: RequestParams) {
    try {
        const { id } = await params;

        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const deleteArenaUsecase: DeleteArenaUsecase = new DeleteArenaUsecase(
            arenaRepository
        );

        await deleteArenaUsecase.execute(Number(id));

        return NextResponse.json(
            { message: "투기장 삭제 성공" },
            { status: 200 }
        );
    } catch (error: unknown) {
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
