// PrismaClient 인스턴스를 싱글톤으로 생성하고 관리하는 모듈
import { PrismaClient } from "@/prisma/generated";

// 전역 객체에 prisma 키가 있는지 확인 (TypeScript 타입 우회)
const globalForPrisma: { prisma: PrismaClient } = global as unknown as {
    prisma: PrismaClient;
};

export const prisma: PrismaClient =
    globalForPrisma.prisma ||
    new PrismaClient({
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    });

// 개발 환경에서는 전역 객체에 인스턴스를 저장하여 재사용
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
