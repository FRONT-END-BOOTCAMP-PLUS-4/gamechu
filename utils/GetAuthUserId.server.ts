// utils/getAuthUserId.server.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export const getAuthUserId = async (): Promise<string | null> => {
    const session = await getServerSession(authOptions);
    return session?.user?.id ?? null;
};
