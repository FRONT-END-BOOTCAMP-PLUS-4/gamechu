import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createCookieStorage } from "@/utils/cookieStorage";

interface AuthUser {
    id: string;
}

interface AuthStore {
    user: AuthUser | null;
    setUser: (user: AuthUser) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: "auth-user",
            storage: createCookieStorage<AuthStore>(),
        }
    )
);
