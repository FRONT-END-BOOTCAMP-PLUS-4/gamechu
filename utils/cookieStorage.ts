import Cookies from "js-cookie";
import type { PersistStorage, StorageValue } from "zustand/middleware";

export function createCookieStorage<T>(): PersistStorage<T> {
    return {
        getItem: (name) => {
            const value = Cookies.get(name);
            if (!value) return null;

            try {
                return JSON.parse(value) as StorageValue<T>;
            } catch (e) {
                console.error("Failed to parse cookie:", e);
                return null;
            }
        },

        setItem: (name, value) => {
            Cookies.set(name, JSON.stringify(value), {
                expires: 1,
                path: "/",
                sameSite: "Lax",
            });
        },

        removeItem: (name) => {
            Cookies.remove(name, { path: "/" });
        },
    };
}
