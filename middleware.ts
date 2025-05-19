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
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 보호하고 싶은 경로 설정
export const config = {
  matcher: ["/profile"],
};
