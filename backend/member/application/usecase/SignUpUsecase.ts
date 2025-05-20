import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { SignUpRequestDto } from "./dto/SignUpRequestDto";
import { Member } from "@/prisma/generated";

export class SignUpUsecase {
    constructor(private repo: MemberRepository) {}

    async execute(dto: SignUpRequestDto): Promise<Member> {
        const existing = await this.repo.findByEmail(dto.email);
        if (existing) {
            throw new Error("이미 존재하는 이메일입니다.");
        }

        return await this.repo.create(dto);
    }
}
