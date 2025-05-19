// backend/member/domain/repositories/IMemberRepository.ts
import { MemberWithRelations } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";

export interface MemberRepository {
  findByEmail(email: string): Promise<MemberWithRelations | null>;
}
