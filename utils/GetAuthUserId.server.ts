// utils/getAuthUserId.server.ts SSR 페이지
import { cookies } from "next/headers";

interface AuthUser {
    id: string;
}

interface PersistedAuthData {
    state: {
        user: AuthUser | null;
    };
    version: number;
}

export const getAuthUserId = async (): Promise<string | null> => {
    const cookieStore = cookies();
    const cookie = (await cookieStore).get("auth-user");
    if (!cookie) return null;

    try {
        const parsed = JSON.parse(cookie.value) as PersistedAuthData;
        return parsed.state.user?.id ?? null;
    } catch (e) {
        console.error("SSR 쿠키 파싱 실패:", e);
        return null;
    }
};
