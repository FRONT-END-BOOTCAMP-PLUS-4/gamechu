// utils/getAuthUserId.client.ts CSR 페이지
import Cookies from "js-cookie";

interface AuthUser {
    id: string;
}

interface PersistedAuthData {
    state: {
        user: AuthUser | null;
    };
    version: number;
}

export const getAuthUserId = (): string | null => {
    const cookie = Cookies.get("auth-user");
    if (!cookie) return null;

    try {
        const parsed = JSON.parse(cookie) as PersistedAuthData;
        return parsed.state.user?.id ?? null;
    } catch (e) {
        console.error("CSR 쿠키 파싱 실패:", e);
        return null;
    }
};
