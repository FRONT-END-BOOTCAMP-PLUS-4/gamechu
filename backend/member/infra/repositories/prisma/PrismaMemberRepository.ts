import {
    PrismaClient,
    Member,
    
} from "@/prisma/generated";

import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";


export class PrismaMemberRepository implements MemberRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async findByEmail(email: string): Promise<Member | null> {
        return this.prisma.member.findUnique({
            where: { email },
        });
    }
}
