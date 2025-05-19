import { DefaultSession, DefaultUser } from "next-auth";
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

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            email: string;
            nickname: string;
            score: number;
            imageUrl: string;
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
        };
    }

    interface User extends DefaultUser {
        id: string;
        email: string;
        nickname: string;
        score: number;
        imageUrl: string;
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
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        nickname: string;
        score: number;
        imageUrl: string;
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
}
