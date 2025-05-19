// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { LoginUsecase } from "@/backend/member/application/usecase/LoginUsecase";
import { LoginRequestDto } from "@/backend/member/application/usecase/dto/LoginRequestDto";
import { LoginResponseDto } from "@/backend/member/application/usecase/dto/LoginResponseDto";
import type { NextAuthOptions } from "next-auth";

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

                return await usecase.execute(dto);
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = (user as LoginResponseDto).id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/log-in",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
