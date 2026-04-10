import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { GetMemberPublicProfileDto } from "./dto/GetMemberPublicProfileDto";

export class GetMemberPublicProfileUsecase {
    constructor(private memberRepository: MemberRepository) {}

    async execute(nickname: string): Promise<GetMemberPublicProfileDto | null> {
        const member = await this.memberRepository.findByNickname(nickname);
        if (!member) return null;

        return new GetMemberPublicProfileDto(
            member.id,
            member.nickname,
            member.imageUrl,
            member.score
        );
    }
}
