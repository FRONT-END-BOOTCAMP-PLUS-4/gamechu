// /backend/member/application/usecase/CheckEmailUsecase.ts
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { EmailCheckResponseDto } from "./dto/EmailCheckResponseDto";

export class EmailCheckUsecase {
    constructor(private repo: MemberRepository) {}

    async execute(email: string): Promise<EmailCheckResponseDto> {
        const member = await this.repo.findByEmail(email);
        return new EmailCheckResponseDto(!!member);
    }
}
