import { PrismaClient, Member } from "@/prisma/generated";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { SignUpRequestDto } from "@/backend/member/application/usecase/dto/SignUpRequestDto";
import bcrypt from "bcryptjs";

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

    async create(data: SignUpRequestDto): Promise<Member> {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const member = await this.prisma.member.create({
            data: {
                nickname: data.nickname,
                email: data.email,
                password: hashedPassword,
                birthDate: new Date(
                    `${data.birthDate.slice(0, 4)}-${data.birthDate.slice(
                        4,
                        6
                    )}-${data.birthDate.slice(6, 8)}`
                ),
                isMale: data.gender === "M",
                imageUrl: "icons/arena.svg",
                score: 500,
            },
        });

        return member;
    }

    async findById(id: string) {
        return this.prisma.member.findUnique({ where: { id } });
    }
}
