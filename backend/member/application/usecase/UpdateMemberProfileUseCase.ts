import { UpdateProfileRequestDto } from "./dto/UpdateProfileRequestDto";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";

export class UpdateMemberProfileUseCase {
    constructor(private readonly memberRepo: MemberRepository) {}

    async execute(dto: UpdateProfileRequestDto): Promise<void> {
        await this.memberRepo.updateProfile(dto); // birthDate 그대로 넘김
    }
}
