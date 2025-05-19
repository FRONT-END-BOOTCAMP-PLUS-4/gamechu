// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { LoginUsecase } from "@/backend/member/application/usecase/LoginUsecase";
import { LoginRequestDto } from "@/backend/member/application/usecase/dto/LoginRequestDto";
import { LoginResponseDto } from "@/backend/member/application/usecase/dto/LoginResponseDto";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "이메일", type: "text" },
                password: { label: "비밀번호", type: "password" },
            },
            async authorize(credentials): Promise<LoginResponseDto | null> {
                if (!credentials?.email || !credentials?.password) return null;

                const repo = new PrismaMemberRepository();
                const usecase = new LoginUsecase(repo);
                const dto = new LoginRequestDto(
                    credentials.email,
                    credentials.password
                );
                const user = await usecase.execute(dto);

                if (!user) return null;

                return {
                    ...user,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.nickname = user.nickname;
                token.imageUrl = user.imageUrl;
                token.birthDate = user.birthDate;
                token.isMale = user.isMale;
                token.score = user.score;
                token.isAttended = user.isAttended;
                token.createdAt = user.createdAt;
                token.deletedAt = user.deletedAt;

                token.wishlists = user.wishlists;
                token.reviews = user.reviews;
                token.reviewLikes = user.reviewLikes;
                token.arenasAsCreator = user.arenasAsCreator;
                token.arenasAsChallenger = user.arenasAsChallenger;
                token.chattings = user.chattings;
                token.votes = user.votes;
                token.notificationRecords = user.notificationRecords;
                token.scoreRecords = user.scoreRecords;
                token.preferredGenres = user.preferredGenres;
                token.preferredPlatforms = user.preferredPlatforms;
                token.preferredThemes = user.preferredThemes;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.nickname = token.nickname;
                session.user.imageUrl = token.imageUrl;
                session.user.birthDate = token.birthDate;
                session.user.isMale = token.isMale;
                session.user.score = token.score;
                session.user.isAttended = token.isAttended;
                session.user.createdAt = token.createdAt;
                session.user.deletedAt = token.deletedAt;

                session.user.wishlists = token.wishlists;
                session.user.reviews = token.reviews;
                session.user.reviewLikes = token.reviewLikes;
                session.user.arenasAsCreator = token.arenasAsCreator;
                session.user.arenasAsChallenger = token.arenasAsChallenger;
                session.user.chattings = token.chattings;
                session.user.votes = token.votes;
                session.user.notificationRecords = token.notificationRecords;
                session.user.scoreRecords = token.scoreRecords;
                session.user.preferredGenres = token.preferredGenres;
                session.user.preferredPlatforms = token.preferredPlatforms;
                session.user.preferredThemes = token.preferredThemes;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
