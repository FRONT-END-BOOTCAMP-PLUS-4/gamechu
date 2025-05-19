import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PreferredGenre,
  PreferredPlatform,
  PreferredTheme,
  Wishlist,
  Review,
  ReviewLike,
  Arena,
  Chatting,
  Vote,
  NotificationRecord,
  ScoreRecord,
} from "@/prisma/generated";

export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  imageUrl: string;
  score: number;
  birthDate: Date;
  isMale: boolean;
  isAttended: boolean;
  createdAt: Date;
  deletedAt: Date | null;

  preferredGenres: PreferredGenre[];
  preferredPlatforms: PreferredPlatform[];
  preferredThemes: PreferredTheme[];

  wishlists: Wishlist[];
  reviews: Review[];
  reviewLikes: ReviewLike[];
  arenasAsCreator: Arena[];
  arenasAsChallenger: Arena[];
  chattings: Chatting[];
  votes: Vote[];
  notificationRecords: NotificationRecord[];
  scoreRecords: ScoreRecord[];
}

interface AuthStore {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
      // localStorage는 Date 객체를 문자열로 저장하므로, 복원 시 수동 변환이 필요할 수도 있음
    }
  )
);
