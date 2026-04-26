import { CreateArenaSchema } from "@/backend/arena/application/usecase/dto/CreateArenaDto";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { validate } from "@/utils/Validation";
import { NextResponse } from "next/server";
import logger from "@/lib/Logger";
import { prisma } from "@/lib/Prisma";

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

        // 아레나 생성·점수 차감·기록 생성을 트랜잭션으로 원자적으로 처리
        const newArena = await prisma.$transaction(async (tx) => {
            const arena = await tx.arena.create({
                data: {
                    creatorId: memberId,
                    challengerId: null,
                    title: validated.data.title,
                    description: validated.data.description,
                    status: 1,
                    startDate: new Date(validated.data.startDate),
                },
            });
            await tx.member.update({
                where: { id: memberId },
                data: { score: { decrement: 100 } },
            });
            await tx.scoreRecord.create({
                data: { memberId, policyId: 4, actualScore: -100 },
            });
            return arena;
        });

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
