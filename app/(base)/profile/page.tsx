// app/profile/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import ProfileSummaryCard from "./components/ProfileSummaryCard";
import ProfileTierCard from "./components/ProfileTierCard";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileInfoTab from "./components/tabs/ProfileInfoTab";
import ProfileReviewTab from "./components/tabs/ProfileReviewTab";

type Review = {
    id: number;
    gameId: number;
    content: string;
    rating: number;
    createdAt: string;
    updatedAt: string | null;
    gameTitle: string;
    imageUrl: string | null;
};

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("reviews");
    const [reviewCount, setReviewCount] = useState<number>(0);
    const [wishlistCount, setWishlistCount] = useState<number>(0);
    const [nickname, setNickname] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string>("/icons/arena.svg");
    const [score, setScore] = useState<number>(0);
    const [createdAt, setCreatedAt] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [birthDate, setBirthDate] = useState<string>("");
    const [isMale, setIsMale] = useState<boolean>(true);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProfileData = useCallback(async () => {
        const id = await getAuthUserId();
        if (!id) return;

        try {
            const reviewRes = await fetch("/api/reviews/member");
            const reviews = await reviewRes.json();
            setReviews(reviews);
            setReviewCount(reviews.length);

            const profileRes = await fetch("/api/member/profile",{
                method: "GET",
            });
            const profile = await profileRes.json();
            setNickname(profile.nickname);
            setImageUrl(profile.imageUrl);
            setScore(profile.score);
            setCreatedAt(profile.createdAt.slice(0, 10));
            setEmail(profile.email);
            setPassword(profile.password);
            setBirthDate(profile.birthDate);
            setIsMale(profile.isMale);
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

            <div className="flex space-x-10">
                <div className="w-[250px]">
                    <ProfileSidebar onSelect={setActiveTab} />
                </div>

                <div className="flex-1">
                    {activeTab === "reviews" && !loading && (
                        <ProfileReviewTab reviews={reviews} />
                    )}
                    {activeTab === "profile" && !loading && (
                        <ProfileInfoTab
                            nickname={nickname}
                            email={email}
                            password={password}
                            imageUrl={imageUrl}
                            birthDate={birthDate}
                            isMale={isMale}
                        />
                    )}
                </div>
            </div>
        </main>
    );
}
