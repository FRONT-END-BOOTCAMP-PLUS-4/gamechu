// 실제 사용하는 Member의 모든 필드 포함


import {
  Wishlist,
  Review,
  PreferredGenre,
  PreferredPlatform,
  PreferredTheme,
  NotificationRecord,
  ReviewLike,
  ScoreRecord,
  Chatting,
  Vote,
  Arena,
} from "@/prisma/generated";


export class LoginResponseDto {
  constructor(
    public readonly id: string,
    public readonly nickname: string,
    public readonly email: string,
    public readonly password: string,
    public readonly imageUrl: string,
    public readonly birthDate: Date,
    public readonly isMale: boolean,
    public readonly score: number,
    public readonly isAttended: boolean,
    public readonly createdAt: Date,
    public readonly deletedAt: Date | null,
    public readonly wishlists: Wishlist[],
    public readonly reviews: Review[],
    public readonly reviewLikes: ReviewLike[],
    public readonly arenasAsCreator: Arena[],
    public readonly arenasAsChallenger: Arena[],
    public readonly chattings: Chatting[],
    public readonly votes: Vote[],
    public readonly notificationRecords: NotificationRecord[],
    public readonly scoreRecords: ScoreRecord[],
    public readonly preferredPlatforms: PreferredPlatform[],
    public readonly preferredGenres: PreferredGenre[],
    public readonly preferredThemes: PreferredTheme[]
  ) {}
}
