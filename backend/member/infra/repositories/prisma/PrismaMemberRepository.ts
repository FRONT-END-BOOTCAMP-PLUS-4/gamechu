
import { PrismaClient, 
  Member,
  Wishlist,
  Review,
  ReviewLike,
  Arena,
  Chatting,
  Vote,
  NotificationRecord,
  ScoreRecord,
  PreferredPlatform,
  PreferredGenre,
  PreferredTheme, } from "@/prisma/generated";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository"


// ✅ 확장 타입 정의
export type MemberWithRelations = Member & {
  wishlists: Wishlist[];
  reviews: Review[];
  reviewLikes: ReviewLike[];
  arenasAsCreator: Arena[];
  arenasAsChallenger: Arena[];
  chattings: Chatting[];
  votes: Vote[];
  notificationRecords: NotificationRecord[];
  scoreRecords: ScoreRecord[];
  preferredPlatforms: PreferredPlatform[];
  preferredGenres: PreferredGenre[];
  preferredThemes: PreferredTheme[];
};


export class PrismaMemberRepository implements MemberRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

   async findByEmail(email: string): Promise<MemberWithRelations | null> {
    return this.prisma.member.findUnique({
      where: { email },
      include: {
        wishlists: true,
        reviews: true,
        reviewLikes: true,
        arenasAsCreator: true,
        arenasAsChallenger: true,
        chattings: true,
        votes: true,
        notificationRecords: true,
        scoreRecords: true,
        preferredPlatforms: true,
        preferredGenres: true,
        preferredThemes: true,
      },
    });
  }
}

