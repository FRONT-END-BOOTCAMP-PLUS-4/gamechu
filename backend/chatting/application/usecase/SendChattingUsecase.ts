// backend/chatting/application/usecase/SendChattingUsecase.ts
import { Chatting } from "@/prisma/generated";
// 레포지토리 인터페이스 import. 여기에 새 메소드 추가 예정.
import { ChattingRepository } from "../../domain/repositories/ChattingRepository";
// ChattingDto는 입력 데이터 형태 정의용. 내용 길이는 여기서 검증.
import { ChattingDto } from "./dto/ChattingDto";

// 상수 정의 (API 핸들러, 프론트와 맞춰야 함)
const MAX_MESSAGE_LENGTH = 200;
const MAX_SEND_COUNT = 5;

// execute 메소드에 필요한 인자들을 정의하는 인터페이스 (선택 사항이지만 명확하게 좋음)
interface ExecuteParams {
    arenaId: number;
    memberId: string;
    content: string;
    // 아레나 참가자 정보를 받아서 유효성 검사에 사용
    creatorId: string;
    challengerId: string | null;
}

export class SendChattingUsecase {
    // 생성자에서 ChattingRepository 구현체를 주입받음
    constructor(private chattingRepository: ChattingRepository) {}

    // execute 메소드의 시그니처를 변경하여 필요한 정보들을 추가로 받음
    // DTO 전체를 받기보다 필요한 데이터만 구조화해서 받는 방식도 좋음
    async execute(params: ExecuteParams): Promise<Chatting> {
        const { arenaId, memberId, content, creatorId, challengerId } = params;

        // -- 1. 글자 수 검증 (비즈니스 규칙) --
        if (content.length > MAX_MESSAGE_LENGTH) {
            console.warn(
                `Usecase: Message exceeds max length (${MAX_MESSAGE_LENGTH}) in arena ${arenaId} for member ${memberId}`
            );
            // 에러 발생: 메시지 길이가 너무 길다
            throw new Error(
                `메시지 길이가 너무 깁니다. (${MAX_MESSAGE_LENGTH}자 제한)`
            );
            // 또는 구체적인 에러 코드를 던져 API 핸들러에서 구분하기 쉽게 할 수도 있음
            // throw new MaxLengthExceededError(`메시지 길이가 ${MAX_MESSAGE_LENGTH}자를 초과했습니다.`);
        }

        // -- 2. 유저가 해당 아레나의 참가자인지 다시 한번 확인 (보안 강화) --
        // API 핸들러에서 이미 확인했지만, 유스케이스에서도 한번 더 하는 것이 안전
        const isParticipant =
            memberId === creatorId || memberId === challengerId;
        if (!isParticipant) {
            console.warn(
                `Usecase: Member ${memberId} is not a participant in arena ${arenaId}`
            );
            // 에러 발생: 아레나 참가자가 아님
            throw new Error("아레나 참가자만 메시지를 보낼 수 있습니다.");
            // throw new NotParticipantError("아레나 참가자가 아닙니다.");
        }

        // -- 3. 메시지 전송 횟수 검증 (비즈니스 규칙) --
        // 레포지토리의 새로운 메소드를 사용하여 해당 유저가 이 아레나에서 보낸 채팅 수를 조회
        // countByArenaIdAndMemberId 메소드는 다음 단계에서 ChattingRepository에 추가할 예정
        const sentCount =
            await this.chattingRepository.countByArenaIdAndMemberId(
                arenaId,
                memberId
            );

        if (sentCount >= MAX_SEND_COUNT) {
            console.warn(
                `Usecase: Member ${memberId} reached max send count (${MAX_SEND_COUNT}) in arena ${arenaId}. Current count: ${sentCount}`
            );
            // 에러 발생: 메시지 전송 횟수를 초과했다
            throw new Error(
                `메시지 전송 횟수(${MAX_SEND_COUNT}번)를 모두 사용했습니다.`
            );
            // throw new SendCountExceededError(`메시지 전송 횟수(${MAX_SEND_COUNT}번)를 초과했습니다.`);
        }

        // -- 4. 모든 검증 통과 시, 메시지 저장 --
        // DTO 형식에 맞춰 데이터 준비 (id는 DB에서 자동 생성될 것이므로 -1 또는 생략 가능)
        const newChatData = {
            id: -1, // Prisma에서는 자동 생성되므로 -1로 설정해도 무방
            memberId: memberId,
            arenaId: arenaId,
            content: content,
            createdAt: new Date(), // 서버 시간 기준
        };

        // 레포지토리의 save 메소드를 사용하여 DB에 저장
        const savedChat = await this.chattingRepository.save(newChatData);

        // -- 5. 메시지 저장 성공 후 (선택 사항: 남은 횟수 계산 후 함께 리턴?) --
        // API 핸들러에서 남은 횟수를 다시 조회하지만, 여기서 조회해서 리턴해줘도 됨.
        // 여기서는 일단 저장된 채팅 객체만 리턴하는 기존 방식 유지.
        // 만약 남은 횟수도 리턴하려면 Promise<Chatting> 대신 Promise<{ chatting: Chatting, remainingSends: number }> 등으로 변경 필요
        // const currentSentCount = sentCount + 1; // 방금 하나 보냈으니 횟수 1 증가
        // const remainingSendsAfter = MAX_SEND_COUNT - currentSentCount;
        // return { chatting: savedChat, remainingSends: remainingSendsAfter };

        return savedChat; // 저장된 채팅 객체 리턴
    }
}

// 필요한 경우, 구체적인 에러 클래스를 정의해서 에러 핸들링을 더 명확하게 할 수 있음
// class MaxLengthExceededError extends Error {}
// class SendCountExceededError extends Error {}
// class NotParticipantError extends Error {}
