// ✅ /backend/member/application/usecase/GetMemberProfileUsecase.ts
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { MemberProfileByNicknameResponseDto } from "./dto/MemberProfileByNicknameResponseDto";

export class GetMemberProfileByNicknameUsecase {
    constructor(private memberRepo: MemberRepository) {}

    async execute(
        nickname: string
    ): Promise<MemberProfileByNicknameResponseDto | null> {
        const member = await this.memberRepo.findByNickname(nickname);
        if (!member) return null;

        return new MemberProfileByNicknameResponseDto(
            member.id,
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
