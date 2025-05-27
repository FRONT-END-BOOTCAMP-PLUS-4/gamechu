// api/arenas/[id]/chattings/route.ts
import { FindChattingUsecase } from "@/backend/chatting/application/usecase/FindChattingUsecase";
// SendChattingUsecase의 execute 시그니처 변경 필요 (우리가 유스케이스 수정할 때 했었지!)
import { SendChattingUsecase } from "@/backend/chatting/application/usecase/SendChattingUsecase";
// 레포지토리 구현체 임포트 (countByArenaIdAndMemberId 메소드 추가했었지!)
import { PrismaChattingRepository } from "@/backend/chatting/infra/repositories/prisma/PrismaChattingRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/prisma/generated"; // PrismaClient 가져오기 (아레나 정보, 채팅 수 조회 위함)

const prisma = new PrismaClient(); // PrismaClient 인스턴스 생성 (주의: 싱글톤 관리 권장)

// 상수 정의 (프론트엔드 훅, 유스케이스와 맞춰야 함)
const MAX_MESSAGE_LENGTH = 200;
const MAX_SEND_COUNT = 5;

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    // 🔐 로그인된 유저 ID 가져오기 (인증)
    const memberId = await getAuthUserId();
    if (!memberId) {
        console.warn("POST /chattings: Unauthorized access attempt");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); // 비인증 사용자 막고 401 반환
    }
    const arenaId = Number((await context.params).id);
    if (isNaN(arenaId)) {
        console.warn(
            `POST /chattings(${
                (await context.params).id
            }): Invalid arenaId provided for member ${memberId}`
        );
        return NextResponse.json({ error: "Invalid arenaId" }, { status: 400 }); // 잘못된 arenaId 처리 및 400 반환
    }

    const { content } = await req.json();
    // 메시지 내용 필수 체크 (프론트에서도 하지만 백엔드에서 한번 더)
    if (
        !content ||
        typeof content !== "string" ||
        content.trim().length === 0
    ) {
        console.warn(
            `POST /chattings(${arenaId}): Empty or invalid content received from member ${memberId}`
        );
        return NextResponse.json(
            { error: "메시지 내용을 입력해주세요." },
            { status: 400 }
        );
    }
    // content 길이가 너무 길면 여기서 1차 거부 (유스케이스에서도 하지만 API 단에서 빨리 거르는 것도 좋음)
    if (content.length > MAX_MESSAGE_LENGTH) {
        console.warn(
            `POST /chattings(${arenaId}): Message exceeds max length (${MAX_MESSAGE_LENGTH}) from member ${memberId}`
        );
        return NextResponse.json(
            {
                error: `메시지 길이는 ${MAX_MESSAGE_LENGTH}자를 초과할 수 없습니다.`,
            },
            { status: 400 }
        ); // 길이 제한 초과 응답
    }

    // -- 아레나 정보 불러오기 및 유효성 검사 --
    // 유스케이스에서 처리해도 되지만, API 핸들러에서 미리 체크하여 불필요한 유스케이스 호출 방지
    try {
        const arena = await prisma.arena.findUnique({
            // 네 Prisma 스키마에 'arena' 테이블이 있다고 가정
            where: { id: arenaId },
            // 유스케이스에서 참가자 확인 등에 필요한 정보만 select (id, creatorId, challengerId, status 등)
            select: {
                id: true,
                creatorId: true,
                challengerId: true,
                status: true,
            },
        });

        if (!arena) {
            console.warn(
                `POST /chattings(${arenaId}): Arena not found for member ${memberId}`
            );
            return NextResponse.json(
                { error: "Arena not found" },
                { status: 404 }
            ); // 아레나 없으면 404
        }

        // -- 유저가 해당 아레나의 참가자인지 확인 --
        const isParticipant =
            memberId === arena.creatorId || memberId === arena.challengerId;
        if (!isParticipant) {
            console.warn(
                `POST /chattings(${arenaId}): Member ${memberId} is not a participant`
            );
            // 참가자가 아니면 메시지 전송 불가
            return NextResponse.json(
                { error: "Not a participant of this arena" },
                { status: 403 }
            ); // Forbidden 응답
        }

        // -- 아레나 상태가 메시지 전송 가능한 상태인지 확인 (예: status 3 - 진행 중) --
        // 이 부분은 아레나 정책에 따라 다를 수 있음. status 3에서만 가능하다고 가정.
        if (arena.status !== 3) {
            console.warn(
                `POST /chattings(${arenaId}): Arena status ${arena.status} is not active for chat for member ${memberId}`
            );
            return NextResponse.json(
                { error: "지금은 메시지를 보낼 수 없는 아레나 상태입니다." },
                { status: 400 }
            ); // 잘못된 상태
        }

        // -- SendChattingUsecase 호출 --
        // 유스케이스에 필요한 레포지토리 인스턴스 생성
        const repository = new PrismaChattingRepository();
        const usecase = new SendChattingUsecase(repository);

        // 유스케이스 execute 메소드 호출
        // 유스케이스에 메시지 내용, 아레나 ID, 멤버 ID, 아레나 참가자 정보 등을 넘겨줌
        // 유스케이스 내부에서 글자 수, 횟수, 참가자 검증 수행
        const chatting = await usecase.execute({
            arenaId: arena.id, // 불러온 아레나 정보 사용
            memberId: memberId,
            content: content.trim(), // 내용 앞뒤 공백 제거해서 넘겨주는 것도 좋음
            creatorId: arena.creatorId, // 불러온 아레나 정보 사용
            challengerId: arena.challengerId, // 불러온 아레나 정보 사용
            // DTO에 id, createdAt이 있다면 그대로 넘기거나 유스케이스 내부에서 생성/처리
        });
        // -- 메시지 전송 성공 후 해당 유저의 '새로운' 보낸 횟수 조회 --
        // 유스케이스에서 저장 성공 후 남은 횟수나 보낸 총 횟수를 같이 리턴해주면 여기서 따로 조회 안 해도 됨.
        // 유스케이스가 리턴해주지 않는다면 여기서 레포지토리 통해 조회
        const userSentCountAfterSend =
            await repository.countByArenaIdAndMemberId(arenaId, memberId); // 레포지토리 메소드 사용
        const remainingSends = MAX_SEND_COUNT - userSentCountAfterSend;

        // -- 응답 데이터에 새로 저장된 채팅 객체와 남은 횟수 정보 포함 --
        // 프론트 (useArenaChatManagement 훅)에서 메시지 객체와 남은 횟수를 같이 받아서 상태 업데이트
        return NextResponse.json(
            {
                newChat: chatting, // 새로 저장된 채팅 객체
                remainingSends: remainingSends, // 현재 유저의 남은 전송 횟수
            },
            { status: 201 } // Created 상태 코드
        );
    } catch (error: any) {
        // 유스케이스, DB 조회 등에서 발생한 에러를 잡음
        console.error(
            `💥 Error processing chat POST for arena ${arenaId} by member ${memberId}:`,
            error
        );
        // 에러 종류에 따라 다른 응답 상태 코드와 메시지 반환
        // 유스케이스에서 던진 구체적인 에러 메시지를 바탕으로 프론트에게 보낼 메시지 결정
        if (
            error.message?.includes("메시지 길이가 너무 깁니다") ||
            error.message?.includes("length limit")
        ) {
            return NextResponse.json(
                {
                    error: `메시지 길이는 ${MAX_MESSAGE_LENGTH}자를 초과할 수 없습니다.`,
                },
                { status: 400 }
            ); // Bad Request (잘못된 데이터)
        }
        if (
            error.message?.includes("메시지 전송 횟수를 초과했습니다") ||
            error.message?.includes("send count limit")
        ) {
            return NextResponse.json(
                {
                    error: `메시지 전송 횟수(${MAX_SEND_COUNT}번)를 모두 사용했습니다.`,
                },
                { status: 400 }
            ); // Bad Request (횟수 제한)
        }
        // 유스케이스에서 참가자 검증도 한다면 여기서 잡을 수 있음
        if (
            error.message?.includes("참가자가 아닙니다") ||
            error.message?.includes("Not a participant")
        ) {
            return NextResponse.json(
                { error: "아레나 참가자만 메시지를 보낼 수 있습니다." },
                { status: 403 }
            ); // Forbidden (권한 없음)
        }
        if (
            error.message?.includes(
                "지금은 메시지를 보낼 수 없는 아레나 상태입니다"
            ) ||
            error.message?.includes("Invalid arena status")
        ) {
            // 유스케이스에서 상태 검증도 한다면
            return NextResponse.json({ error: error.message }, { status: 400 }); // Bad Request (잘못된 상태)
        }

        // 그 외 알 수 없는 서버 내부 오류
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 } // 서버 내부 오류 응답
        );
    } finally {
        // Serverless 환경에서는 요청 처리 후 Prisma Client 연결 해제가 필요할 수 있음
        // await prisma.$disconnect();
    }
}

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const arenaId = Number((await context.params).id);
    if (isNaN(arenaId)) {
        console.warn(
            `GET /chattings: Invalid arenaId: ${(await context.params).id}`
        );
        return NextResponse.json({ error: "Invalid arenaId" }, { status: 400 }); // 잘못된 arenaId 처리
    }

    // 🔐 로그인된 유저 ID 가져오기 (보낸 횟수 조회 위함)
    const memberId = await getAuthUserId();
    // 참고: 로그인 안 한 유저도 채팅 목록 자체는 볼 수 있게 할 수도 있음.
    // 이 경우, memberId가 null일 때 보낸 횟수 정보는 제공하지 않거나 0으로 처리.
    if (!memberId) {
        console.warn(
            `GET /chattings(${arenaId}): User not authenticated. Cannot fetch sent count.`
        );
        // 로그인 안 해도 채팅 목록 보여주려면 여기서 return 하지 않음.
        // return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); // 로그인 안 한 유저 막기
    }

    // 레포지토리 인스턴스 생성
    const repository = new PrismaChattingRepository();
    // 채팅 목록 조회 유스케이스 (이 유스케이스 자체는 수정 불필요)
    const findUsecase = new FindChattingUsecase(repository);

    try {
        // 채팅 목록 조회
        const chatList = await findUsecase.execute(arenaId);

        // -- 추가: 현재 유저의 해당 아레나에서의 보낸 총 메시지 수 조회 --
        let userSentCount = 0;
        // 로그인된 유저이고 arenaId가 유효할 때만 레포지토리 통해 조회
        if (memberId && typeof arenaId === "number") {
            // 레포지토리의 countByArenaIdAndMemberId 메소드 사용 (구현했었지!)
            userSentCount = await repository.countByArenaIdAndMemberId(
                arenaId,
                memberId
            );
        }
        // 남은 횟수 계산 (로그인 안 했거나 횟수 조회 실패 시 어떻게 보여줄지 결정. 여기선 일단 최대 횟수로 보여주기)
        const remainingSends = memberId
            ? MAX_SEND_COUNT - userSentCount
            : MAX_SEND_COUNT;

        // -- 응답 데이터에 초기 채팅 목록과 남은 횟수 정보 포함 --
        // 프론트 (useArenaChatManagement 훅)에서 초기 데이터 로딩 시 남은 횟수를 알 수 있도록
        return NextResponse.json({
            chats: chatList, // 채팅 목록 배열
            remainingSends: remainingSends, // 현재 유저의 남은 전송 횟수
        });
    } catch (error) {
        console.error(
            `💥 Error processing chat GET for arena ${arenaId}:`,
            error
        );
        // 에러 발생 시 알 수 없는 오류 응답
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 } // 서버 내부 오류 응답
        );
    } finally {
        // Serverless 환경에서는 요청 처리 후 Prisma Client 연결 해제가 필요할 수 있음
        // await prisma.$disconnect();
    }
}
