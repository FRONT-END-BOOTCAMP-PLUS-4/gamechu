// backend/chatting/infra/repositories/prisma/PrismaChattingRepository.ts
import { ChattingRepository } from "@/backend/chatting/domain/repositories/ChattingRepository";
import { Chatting, PrismaClient } from "@/prisma/generated"; // PrismaClient와 Chatting 모델 임포트

// NOTE: 보통 PrismaClient 인스턴스는 전체 애플리케이션에서 싱글톤으로 관리하는 것이 권장됨.
// 여기서는 간단하게 클래스 안에서 생성하지만, 실제 프로덕션 코드에서는 다를 수 있음.
// import { prisma } from "@/lib/prisma"; // 예: 중앙에서 관리하는 prisma 인스턴스

export class PrismaChattingRepository implements ChattingRepository {
    private prisma: PrismaClient; // PrismaClient 타입

    constructor() {
        // 중앙에서 관리하는 prisma 인스턴스가 있다면 그걸 사용
        // this.prisma = prisma;
        // 없다면 여기서 생성
        this.prisma = new PrismaClient();
    }

    // ChattingRepository 인터페이스의 save 메소드 구현 (기존)
    async save(chatting: Chatting): Promise<Chatting> {
        console.log("PrismaRepo - Saving chatting:", chatting);
        try {
            const savedChat = await this.prisma.chatting.create({
                data: {
                    memberId: chatting.memberId,
                    arenaId: chatting.arenaId,
                    content: chatting.content,
                    createdAt: chatting.createdAt,
                },
            });
            console.log("PrismaRepo - Saved chatting:", savedChat);
            return savedChat;
        } catch (error) {
            console.error("PrismaRepo - Error saving chatting:", error);
            // 에러를 다시 던져서 상위 레이어(유스케이스, API)에서 처리하게 함
            throw error;
        }
    }

    // ChattingRepository 인터페이스의 findByArenaId 메소드 구현 (기존)
    async findByArenaId(arenaId: number): Promise<Chatting[]> {
        console.log(`PrismaRepo - Finding chattings for arenaId: ${arenaId}`);
        try {
            const chatList = await this.prisma.chatting.findMany({
                where: {
                    arenaId: arenaId,
                },
                orderBy: {
                    createdAt: "asc", // 오래된 순서대로 정렬
                },
            });
            console.log(
                `PrismaRepo - Found ${chatList.length} chattings for arena ${arenaId}`
            );
            return chatList;
        } catch (error) {
            console.error(
                `PrismaRepo - Error finding chattings for arena ${arenaId}:`,
                error
            );
            throw error; // 에러 다시 던지기
        }
    }

    // -- 추가: ChattingRepository 인터페이스의 countByArenaIdAndMemberId 메소드 구현 --
    // 특정 아레나(arenaId)에서 특정 멤버(memberId)가 보낸 채팅 수를 세어옴
    async countByArenaIdAndMemberId(
        arenaId: number,
        memberId: string
    ): Promise<number> {
        console.log(
            `PrismaRepo - Counting chattings for arenaId ${arenaId} and memberId ${memberId}`
        );
        try {
            // Prisma client의 count 기능을 사용하여 조건에 맞는 레코드 수를 센다
            const count = await this.prisma.chatting.count({
                where: {
                    arenaId: arenaId, // 해당 아레나 ID와 일치
                    memberId: memberId, // 해당 멤버 ID와 일치
                },
            });
            console.log(
                `PrismaRepo - Found ${count} chattings for arena ${arenaId} and member ${memberId}`
            );
            return count; // 세어진 개수(숫자) 반환
        } catch (error) {
            console.error(
                `PrismaRepo - Error counting chattings for arena ${arenaId} and member ${memberId}:`,
                error
            );
            // DB 에러 등 발생 시 에러를 다시 던져 상위 레이어에서 처리하게 함
            throw error;
        }
    }
    // NOTE: 필요에 따라 prisma.$connect() 및 prisma.$disconnect() 관리가 필요할 수 있음
}
