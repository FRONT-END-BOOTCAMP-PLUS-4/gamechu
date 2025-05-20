import { Member } from "@/prisma/generated";
import { SignUpRequestDto } from "../../application/usecase/dto/SignUpRequestDto";

export interface MemberRepository {
    findByEmail(email: string): Promise<Member | null>;//로그인
    create(data: SignUpRequestDto): Promise<Member>;//회원가입
}
