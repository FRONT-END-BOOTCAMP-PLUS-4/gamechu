import { compare } from "bcryptjs";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { LoginRequestDto } from "./dto/LoginRequestDto";
import { LoginResponseDto } from "./dto/LoginResponseDto";

export class LoginUsecase {
    constructor(private readonly memberRepository: MemberRepository) {}

    async execute(dto: LoginRequestDto): Promise<LoginResponseDto | null> {
        const member = await this.memberRepository.findByEmail(dto.email);
        if (!member) return null;

        const isMatch = await compare(dto.password, member.password);
        if (!isMatch) return null;

        return new LoginResponseDto(
            member.id,
        );
    }
}
