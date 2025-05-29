import { CreateArenaUsecase } from "@/backend/arena/application/usecase/CreateArenaUsecase";
import { CreateArenaDto } from "@/backend/arena/application/usecase/dto/CreateArenaDto";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { Arena } from "@/prisma/generated";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // body validation
        const body = await request.json();
        if (!body.title) {
            return NextResponse.json(
                { error: "투기장 제목을 찾을 수 없습니다." },
                { status: 400 }
            );
        }

        if (!body.description) {
            return NextResponse.json(
                { error: "투기장 내용을 찾을 수 없습니다." },
                { status: 400 }
            );
        }

        // member validation
        const memberId: string | null = await getAuthUserId();
        if (!memberId) {
            return NextResponse.json(
                { error: "투기장 작성 권한이 없습니다." },
                { status: 401 }
            );
        }

        // execute usecase
        const createArenaDto: CreateArenaDto = new CreateArenaDto(
            memberId!,
            body.title,
            body.description,
            new Date()
        );
        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const createArenaUsecase: CreateArenaUsecase = new CreateArenaUsecase(
            arenaRepository
        );
        const newArena: Arena = await createArenaUsecase.execute(
            createArenaDto
        );
        return NextResponse.json(newArena, { status: 201 });
    } catch (error: unknown) {
        console.error("Error creating arenas:", error);
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "투기장 생성 실패" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
