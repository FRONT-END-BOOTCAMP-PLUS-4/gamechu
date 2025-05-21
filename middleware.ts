import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const isLoggedIn = !!token;

    const { pathname } = req.nextUrl;

    const isProtectedPath = pathname.startsWith("/profile");
    const isAuthPage = pathname === "/log-in" || pathname === "/sign-up";

    // ✅ 로그인하지 않은 사용자가 보호된 페이지에 접근할 경우 → 로그인 페이지로 리디렉션
    if (isProtectedPath && !isLoggedIn) {
        const loginUrl = new URL("/log-in", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ✅ 로그인한 사용자가 로그인/회원가입 페이지에 접근할 경우 → 홈으로 리디렉션
    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile", "/log-in", "/sign-up"], // ✅ 감시할 경로들
};
