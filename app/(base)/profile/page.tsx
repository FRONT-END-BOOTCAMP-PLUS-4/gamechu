// app/profile/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import ProfileSummaryCard from "./components/ProfileSummaryCard";
import ProfileTierCard from "./components/ProfileTierCard";

export default function ProfilePage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [reviewCount, setReviewCount] = useState<number>(0);
    const [wishlistCount, setWishlistCount] = useState<number>(0);
    const [nickname, setNickname] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string>("/icons/arena.svg");
    const [score, setScore] = useState<number>(0);
    const [createdAt, setCreatedAt] = useState<string>("");
    const [loading, setLoading] = useState(true);

    const fetchProfileData = useCallback(async () => {
        const id = await getAuthUserId();
        if (!id) return;
        setUserId(id);

        try {
            const reviewRes = await fetch("/api/reviews/member");
            const reviews = await reviewRes.json();
            setReviewCount(reviews.length);

            //const wishlistRes = await fetch("/api/member/wishlists");
            //const wishlists = await wishlistRes.json();
            //setWishlistCount(wishlists.length);

            const profileRes = await fetch("/api/member/profile");
            const profile = await profileRes.json();
            setNickname(profile.nickname);
            setImageUrl(profile.imageUrl);
            setScore(profile.score);
            setCreatedAt(profile.createdAt.slice(0, 10)); // yyyy-mm-dd

        } catch (err) {
            console.error("프로필 데이터 로딩 실패:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    return (
        <main className="min-h-screen bg-background-400 font-sans text-font-100 p-10">
            <div className="flex space-x-10 mb-10">
                <ProfileSummaryCard
                    reviewCount={reviewCount}
                    wishlistCount={wishlistCount}
                    nickname={nickname}
                    imageUrl={imageUrl}
                    score={score}
                    createdAt={createdAt}
                />
                <ProfileTierCard score={score} />

            </div>

            {!loading && userId && (
                <p className="text-sm text-font-200 mb-4">유저 ID: {userId}</p>
            )}
        </main>
    );
}
