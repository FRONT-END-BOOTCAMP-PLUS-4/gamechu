import { PrismaClient, Member } from "@/prisma/generated";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { SignUpRequestDto } from "@/backend/member/application/usecase/dto/SignUpRequestDto";
import bcrypt from "bcryptjs";
import { UpdateProfileRequestDto } from "@/backend/member/application/usecase/dto/UpdateProfileRequestDto";

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

    async updateProfile(dto: UpdateProfileRequestDto): Promise<void> {
        const { birthDate: rawBirth, ...rest } = dto;

        if (!/^\d{8}$/.test(rawBirth)) {
            throw new Error("생년월일 형식은 yyyymmdd여야 합니다.");
        }

        const year = parseInt(rawBirth.slice(0, 4), 10);
        const month = parseInt(rawBirth.slice(4, 6), 10)-1;
        const day = parseInt(rawBirth.slice(6, 8), 10);

        const parsedDate = new Date(Date.UTC(year, month, day)); // ✅ UTC 기준 날짜 생성
        if (isNaN(parsedDate.getTime())) {
            throw new Error("유효하지 않은 생년월일입니다.");
        }

        await this.prisma.member.update({
            where: { id: dto.memberId },
            data: {
                nickname: rest.nickname,
                isMale: rest.isMale,
                birthDate: parsedDate, // ✅ 이곳에서만 파싱
                imageUrl: rest.imageUrl,
            },
        });
    }
}
