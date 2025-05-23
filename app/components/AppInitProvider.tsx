"use client";

import { useEffect } from "react";
import { getSession } from "next-auth/react";
import { useAuthStore } from "@/stores/AuthStore";

export default function AppInitProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const setUser = useAuthStore((state) => state.setUser);

    useEffect(() => {
        const init = async () => {
            const session = await getSession();
            console.log("✅ 세션 확인됨:", session?.user); // 추가
            if (session?.user) {
                setUser(session.user);
            }
        };
        init();
    }, [setUser]);

    return <>{children}</>;
}
