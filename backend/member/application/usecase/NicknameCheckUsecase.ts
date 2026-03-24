import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { NicknameCheckResponseDto } from "./dto/NicknameCheckResponseDto";

export class NicknameCheckUsecase {
    constructor(private repo: MemberRepository) {}

    async execute(nickname: string): Promise<NicknameCheckResponseDto> {
        const member = await this.repo.findByNickname(nickname);
        return new NicknameCheckResponseDto(!!member);
    }
}
