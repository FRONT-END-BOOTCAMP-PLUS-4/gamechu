// app/profile/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import ProfileSummaryCard from "./components/ProfileSummaryCard";
import ProfileTierCard from "./components/ProfileTierCard";

export default function ProfilePage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserId = useCallback(async () => {
        const id = await getAuthUserId();
        setUserId(id);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUserId();
    }, [fetchUserId]);

    return (
        <main className="min-h-screen bg-background-400 font-sans text-font-100 p-10">
            <div className="flex space-x-10 mb-10">
                <ProfileSummaryCard />
                <ProfileTierCard />
            </div>

            {!loading && userId && (
                <p className="text-sm text-font-200 mb-4">유저 ID: {userId}</p>
            )}
        </main>
    );
}