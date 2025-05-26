import { Member } from "@/prisma/generated";
import { SignUpRequestDto } from "../../application/usecase/dto/SignUpRequestDto";
import { UpdateProfileRequestDto } from "@/backend/member/application/usecase/dto/UpdateProfileRequestDto";

export interface MemberRepository {
    findByEmail(email: string): Promise<Member | null>;//로그인
    create(data: SignUpRequestDto): Promise<Member>;//회원가입
    findById(id: string): Promise<Member | null>;//회원정보 조회
    updateProfile(data: UpdateProfileRequestDto): Promise<void>;
    
}
