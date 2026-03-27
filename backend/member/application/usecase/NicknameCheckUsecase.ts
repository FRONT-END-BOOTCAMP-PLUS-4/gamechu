import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { NicknameCheckResponseDto } from "./dto/NicknameCheckResponseDto";

export class NicknameCheckUsecase {
    constructor(private repo: MemberRepository) {}

    async execute(nickname: string): Promise<NicknameCheckResponseDto> {
        if (nickname.length > 8) {
            throw new Error("닉네임은 8자 이하여야 합니다.");
        }
        const member = await this.repo.findByNickname(nickname);
        return new NicknameCheckResponseDto(!!member, member?.id ?? null);
    }
}
