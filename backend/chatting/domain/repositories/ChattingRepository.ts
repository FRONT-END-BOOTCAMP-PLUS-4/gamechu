// backend/chatting/domain/repositories/ChattingRepository.ts
import { Chatting } from "@/prisma/generated";

export interface ChattingRepository {
    // findById(id: number): Promise<Chatting | null>;
    save(chatting: Chatting): Promise<Chatting>; // 메시지 저장 기능 (기존)
    findByArenaId(arenaId: number): Promise<Chatting[]>; // 특정 아레나 채팅 목록 조회 기능 (기존)

    // -- 추가: 특정 아레나에서 특정 멤버가 보낸 채팅 수를 세는 기능 --
    countByArenaIdAndMemberId(
        arenaId: number,
        memberId: string
    ): Promise<number>;
}
