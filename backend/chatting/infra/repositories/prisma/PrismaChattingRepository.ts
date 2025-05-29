// backend/chatting/infra/repositories/prisma/PrismaChattingRepository.ts
import { ChattingRepository } from "@/backend/chatting/domain/repositories/ChattingRepository";
import { Chatting, PrismaClient } from "@/prisma/generated";

export class PrismaChattingRepository implements ChattingRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    // ChattingRepository 인터페이스의 save 메소드 구현
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

            throw error;
        }
    }

    // ChattingRepository 인터페이스의 findByArenaId 메소드 구현
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
            throw error;
        }
    }

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

            throw error;
        }
    }
}
