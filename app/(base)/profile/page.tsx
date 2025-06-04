"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import ProfileSummaryCard from "./components/ProfileSummaryCard";
import ProfileTierCard from "./components/ProfileTierCard";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileInfoTab from "./components/tabs/ProfileInfoTab";
import ProfileReviewTab from "./components/tabs/ProfileReviewTab";
import ProfileWishlistTab from "./components/tabs/ProfileWishlistTab";
import ProfilePointHistoryTab from "./components/tabs/ProfilePointHistoryTab";
import ProfileArenaTab from "./components/tabs/ProfileArenaTab";
import { useLoadingStore } from "@/stores/loadingStore"; // ✅ 추가

type WishlistGame = {
    id: number;
    title: string;
    developer: string;
    thumbnail: string;
    platform: string;
    expertRating: number;
    reviewCount: number;
};

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
    const { setLoading } = useLoadingStore(); // ✅ 전역 로딩 상태 사용
    const [activeTab, setActiveTab] = useState("reviews");
    const [reviewCount, setReviewCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [wishlistGames, setWishlistGames] = useState<WishlistGame[]>([]);
    const [nickname, setNickname] = useState("");
    const [imageUrl, setImageUrl] = useState("/icons/arena.svg");
    const [score, setScore] = useState(0);
    const [createdAt, setCreatedAt] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [isMale, setIsMale] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoaded, setIsLoaded] = useState(false); // ✅ 단순 로딩 여부 체크용

    const fetchProfileData = useCallback(async () => {
        const id = await getAuthUserId();
        if (!id) return;

        setLoading(true); // ✅ 전역 로딩 시작

        try {
            const [reviewRes, profileRes, wishlistRes] = await Promise.all([
                fetch("/api/reviews/member"),
                fetch("/api/member/profile"),
                fetch("/api/member/wishlists"),
            ]);

            const reviews = await reviewRes.json();
            const profile = await profileRes.json();
            const wishlist = await wishlistRes.json();

            setReviews(reviews);
            setReviewCount(reviews.length);

            setNickname(profile.nickname);
            setImageUrl(profile.imageUrl);
            setScore(profile.score);
            setCreatedAt(profile.createdAt.slice(0, 10));
            setEmail(profile.email);
            setPassword(profile.password);
            setBirthDate(profile.birthDate);
            setIsMale(profile.isMale);

            setWishlistGames(wishlist);
            setWishlistCount(wishlist.length);
            setIsLoaded(true);
        } catch (err) {
            console.error("프로필 데이터 로딩 실패:", err);
        } finally {
            setLoading(false); // ✅ 전역 로딩 종료
        }
    }, [setLoading]);

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
                    {activeTab === "reviews" && isLoaded && (
                        <ProfileReviewTab reviews={reviews} />
                    )}
                    {activeTab === "profile" && isLoaded && (
                        <ProfileInfoTab
                            nickname={nickname}
                            email={email}
                            password={password}
                            imageUrl={imageUrl}
                            birthDate={birthDate}
                            isMale={isMale}
                        />
                    )}
                    {activeTab === "wishlists" && isLoaded && (
                        <ProfileWishlistTab games={wishlistGames} />
                    )}
                    {activeTab === "score-history" && isLoaded && (
                        <ProfilePointHistoryTab />
                    )}
                    {activeTab === "arena" && isLoaded && (
                        <ProfileArenaTab />
                    )}
                </div>
            </div>
        </main>
    );
}
