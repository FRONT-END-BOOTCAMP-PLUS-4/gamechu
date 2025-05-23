// ✅ /backend/member/application/usecase/GetMemberProfileUsecase.ts
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { MemberProfileResponseDto } from "./dto/MemberProfileResponseDto";

export class GetMemberProfileUsecase {
    constructor(private memberRepo: MemberRepository) {}

    async execute(memberId: string): Promise<MemberProfileResponseDto | null> {
        const member = await this.memberRepo.findById(memberId);
        if (!member) return null;

        return new MemberProfileResponseDto(
            member.nickname,
            member.password,
            member.email,
            member.imageUrl,
            member.birthDate.toISOString(),
            member.isMale,
            member.score,
            member.createdAt.toISOString()
        );
    }
}