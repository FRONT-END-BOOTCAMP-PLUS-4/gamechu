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
import { useLoadingStore } from "@/stores/loadingStore";

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

type WishlistPageData = {
    wishlists: WishlistGame[];
    currentPage: number;
    pages: number[];
    endPage: number;
    totalCount: number;
};

export default function ProfilePage() {
    const { setLoading } = useLoadingStore();
    const [activeTab, setActiveTab] = useState("reviews");
    const [reviewCount, setReviewCount] = useState(0);
    const [wishlistPageData, setWishlistPageData] = useState<WishlistPageData>({
        wishlists: [],
        currentPage: 1,
        pages: [],
        endPage: 1,
        totalCount: 0,
    });

    const [nickname, setNickname] = useState("");
    const [imageUrl, setImageUrl] = useState("/icons/arena.svg");
    const [score, setScore] = useState(0);
    const [createdAt, setCreatedAt] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [isMale, setIsMale] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchWishlistPage = async (page: number) => {
        const res = await fetch(`/api/member/wishlists?page=${page}`);
        const data = await res.json();
        setWishlistPageData(data);
    };

    const fetchProfileData = useCallback(async () => {
        const id = await getAuthUserId();
        if (!id) return;

        setLoading(true);

        try {
            const [reviewRes, profileRes] = await Promise.all([
                fetch("/api/reviews/member"),
                fetch("/api/member/profile"),
            ]);

            const reviews = await reviewRes.json();
            const profile = await profileRes.json();

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

            await fetchWishlistPage(1); // ✅ 1페이지 위시리스트 호출

            setIsLoaded(true);
        } catch (err) {
            console.error("프로필 데이터 로딩 실패:", err);
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    return (
        <main className="min-h-screen w-full bg-background-400 px-4 py-4 font-sans text-font-100 min-[821px]:px-10 min-[821px]:py-10">
            {/* 상단 카드 영역 */}
            <div className="mb-10 flex flex-col items-center gap-4 min-[821px]:flex-row min-[821px]:items-start min-[821px]:gap-10">
                <ProfileSummaryCard
                    reviewCount={reviewCount}
                    wishlistCount={wishlistPageData.totalCount}
                    nickname={nickname}
                    imageUrl={imageUrl}
                    score={score}
                    createdAt={createdAt}
                />
                <ProfileTierCard score={score} />
            </div>

            {/* 본문 */}
            <div className="flex flex-col max-[820px]:items-center min-[821px]:flex-row min-[821px]:space-x-10">
                {/* 사이드바  */}
                <div className="mb-6 w-full max-[820px]:w-full min-[821px]:mb-0 min-[821px]:w-[250px]">
                    <ProfileSidebar onSelect={setActiveTab} />
                </div>

                {/* 컨텐츠 영역 */}
                <div className="w-full min-w-0 flex-1">
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
                        <ProfileWishlistTab
                            games={wishlistPageData.wishlists}
                            pages={wishlistPageData.pages}
                            currentPage={wishlistPageData.currentPage}
                            endPage={wishlistPageData.endPage}
                            onPageChange={fetchWishlistPage}
                        />
                    )}
                    {activeTab === "score-history" && isLoaded && (
                        <ProfilePointHistoryTab />
                    )}
                    {activeTab === "arena" && isLoaded && <ProfileArenaTab />}
                </div>
            </div>
        </main>
    );
}
