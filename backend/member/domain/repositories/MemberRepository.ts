import { Member } from "@/prisma/generated";
import { SignUpRequestDto } from "../../application/usecase/dto/SignUpRequestDto";
import { UpdateProfileRequestDto } from "@/backend/member/application/usecase/dto/UpdateProfileRequestDto";

export interface MemberRepository {
    findByEmail(email: string): Promise<Member | null>; // 로그인
    create(data: SignUpRequestDto): Promise<Member>; // 회원가입
    findById(id: string): Promise<Member | null>; // 회원정보 조회
    updateProfile(data: UpdateProfileRequestDto): Promise<void>;
    incrementScore(memberId: string, delta: number): Promise<void>;
    // findByNickname(nickname: string): Promise<Member | null>; //닉네임으로 멤버 정보 가져오기

    // ✅ 출석 점수 관련 메서드
    getLastAttendedDate(memberId: string): Promise<Date | null>;
    updateLastAttendedDate(memberId: string, date: Date): Promise<void>;
}
