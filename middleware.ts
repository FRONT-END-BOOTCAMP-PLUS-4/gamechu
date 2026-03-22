import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // CSRF: reject cross-origin mutations on /api/member/*
    const method = req.method;
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const isMemberApi = pathname.startsWith("/api/member/");

    if (isMutation && isMemberApi) {
        const origin = req.headers.get("origin");
        if (origin !== null) {
            try {
                const originHost = new URL(origin).host;
                const requestHost = req.headers.get("host") ?? "";
                if (originHost !== requestHost) {
                    return NextResponse.json(
                        { message: "Forbidden" },
                        { status: 403 }
                    );
                }
            } catch {
                return NextResponse.json(
                    { message: "Forbidden" },
                    { status: 403 }
                );
            }
        }
    }

    // Auth: redirect unauthenticated users away from protected pages
    const token = await getToken({ req });
    const isLoggedIn = !!token;

    const isProtectedPath = pathname.startsWith("/profile");
    const isAuthPage = pathname === "/log-in" || pathname === "/sign-up";

    if (isProtectedPath && !isLoggedIn) {
        const loginUrl = new URL("/log-in", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile", "/log-in", "/sign-up", "/api/member/:path*"],
};
