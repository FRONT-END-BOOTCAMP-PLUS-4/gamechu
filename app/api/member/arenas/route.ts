import { CreateArenaUsecase } from "@/backend/arena/application/usecase/CreateArenaUsecase";
import { CreateArenaDto } from "@/backend/arena/application/usecase/dto/CreateArenaDto";
import { CreateArenaSchema } from "@/backend/arena/application/usecase/dto/CreateArenaDto";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { CreateScoreRecordDto } from "@/backend/score-record/application/usecase/dto/CreateScoreRecordDto";
import { Arena } from "@/prisma/generated";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { validate } from "@/utils/Validation";
import { NextResponse } from "next/server";
import logger from "@/lib/Logger";

export async function POST(request: Request) {
    const memberId: string | null = await getAuthUserId();
    const log = logger.child({ route: "/api/member/arenas", method: "POST" });
    try {
        // member validation
        if (!memberId) {
            return NextResponse.json(
                { message: "투기장 작성 권한이 없습니다." },
                { status: 401 }
            );
        }

        // body validation
        const body = await request.json();
        const validated = validate(CreateArenaSchema, body);
        if (!validated.success) return validated.response;

        // score validation
        const memberRepository = new PrismaMemberRepository();
        const member = await memberRepository.findById(memberId);
        if (!member) {
            return NextResponse.json(
                { message: "회원 정보를 찾을 수 없습니다." },
                { status: 404 }
            );
        }
        if (member.score < 100) {
            return NextResponse.json(
                {
                    message:
                        "투기장 작성을 위해서는 최소 100점 이상의 점수가 필요합니다.",
                },
                { status: 403 }
            );
        }

        // execute usecase
        const createArenaDto: CreateArenaDto = new CreateArenaDto(
            memberId,
            validated.data.title,
            validated.data.description,
            new Date(validated.data.startDate)
        );
        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const createArenaUsecase: CreateArenaUsecase = new CreateArenaUsecase(
            arenaRepository
        );
        const newArena: Arena =
            await createArenaUsecase.execute(createArenaDto);

        // TODO: 아레나 생성·점수 차감·기록 생성을 prisma.$transaction으로 묶어 원자성 보장 필요
        // 현재는 순차 실행이므로 중간 단계 실패 시 데이터 불일치가 발생할 수 있음
        // ref: https://github.com/FRONT-END-BOOTCAMP-PLUS-4/gamechu/issues/307
        await memberRepository.incrementScore(memberId, -100);

        const scoreRecordRepository = new PrismaScoreRecordRepository();
        await scoreRecordRepository.createRecord(
            new CreateScoreRecordDto(memberId, 4, -100)
        );

        return NextResponse.json(newArena, { status: 201 });
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "아레나 생성 실패");
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
