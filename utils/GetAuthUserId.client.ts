// utils/getAuthUserId.client.ts
import { getSession } from "next-auth/react";

export const getAuthUserId = async (): Promise<string | null> => {
    const session = await getSession();
    return session?.user?.id ?? null;
};
