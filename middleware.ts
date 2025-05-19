// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });

    const isLoggedIn = !!token;
    const isProtectedPath = req.nextUrl.pathname.startsWith("/profile");

    if (isProtectedPath && !isLoggedIn) {
        const loginUrl = new URL("/log-in", req.url);
        loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname); //마이페이제에서 로그아웃 시 로그인 페이지로 이동하여 로그인 후 콜백 URL 넣어줌
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile"],
};
