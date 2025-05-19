import { Member } from "@/prisma/generated";

export interface MemberRepository {
    findByEmail(email: string): Promise<Member | null>;
}
