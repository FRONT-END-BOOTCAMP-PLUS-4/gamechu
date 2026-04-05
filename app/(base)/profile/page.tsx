"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys } from "@/lib/QueryKeys";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import ProfileSummaryCard from "./components/ProfileSummaryCard";
import ProfileTierCard from "./components/ProfileTierCard";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileInfoTab from "./components/tabs/ProfileInfoTab";
import ProfileReviewTab from "./components/tabs/ProfileReviewTab";
import ProfileWishlistTab from "./components/tabs/ProfileWishlistTab";
import ProfilePointHistoryTab from "./components/tabs/ProfilePointHistoryTab";
import ProfileArenaTab from "./components/tabs/ProfileArenaTab";
import { useLoadingStore } from "@/stores/LoadingStore";

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

type MyProfile = {
    nickname: string;
    imageUrl: string;
    score: number;
    createdAt: string;
    email: string;
    password: string;
    birthDate: string;
    isMale: boolean;
};

export default function ProfilePage() {
    const { setLoading } = useLoadingStore();
    const [activeTab, setActiveTab] = useState("reviews");
    const [wishlistPage, setWishlistPage] = useState(1);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        getAuthUserId().then((id) => setIsAuthenticated(!!id));
    }, []);

    const { data: profile, isLoading: profileLoading } = useQuery<MyProfile>({
        queryKey: queryKeys.myProfile(),
        queryFn: () => fetcher("/api/member/profile"),
        enabled: isAuthenticated,
    });

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
        queryKey: queryKeys.myReviews(),
        queryFn: () => fetcher("/api/reviews/member"),
        enabled: isAuthenticated,
    });

    const { data: wishlistPageData, isLoading: wishlistLoading } = useQuery<WishlistPageData>({
        queryKey: queryKeys.myWishlists(wishlistPage),
        queryFn: () => fetcher(`/api/member/wishlists?page=${wishlistPage}`),
        enabled: isAuthenticated,
    });

    const isLoading = profileLoading || reviewsLoading || wishlistLoading;

    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading, setLoading]);

    const nickname = profile?.nickname ?? "";
    const imageUrl = profile?.imageUrl ?? "/icons/arena.svg";
    const score = profile?.score ?? 0;
    const createdAt = profile?.createdAt?.slice(0, 10) ?? "";
    const email = profile?.email ?? "";
    const password = profile?.password ?? "";
    const birthDate = profile?.birthDate ?? "";
    const isMale = profile?.isMale ?? true;
    const reviewCount = reviews.length;
    const wishlistData: WishlistPageData = wishlistPageData ?? {
        wishlists: [],
        currentPage: 1,
        pages: [],
        endPage: 1,
        totalCount: 0,
    };
    const isLoaded = !isLoading && !!profile;

    return (
        <section className="min-h-screen w-full bg-background-400 px-4 py-4 font-sans text-font-100 md:px-10 md:py-10">
            {/* 상단 카드 영역 */}
            <div className="mb-10 flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-10">
                <ProfileSummaryCard
                    isOwnProfile={true}
                    reviewCount={reviewCount}
                    wishlistCount={wishlistData.totalCount}
                    nickname={nickname}
                    imageUrl={imageUrl}
                    score={score}
                    createdAt={createdAt}
                />
                <ProfileTierCard isOwnProfile={true} score={score} />
            </div>

            {/* 본문 */}
            <div className="flex flex-col md:flex-row md:items-start md:space-x-10">
                {/* 사이드바 */}
                <div className="mb-6 w-full md:mb-0 md:w-[250px]">
                    <ProfileSidebar isOwnProfile={true} onSelect={setActiveTab} />
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
                            games={wishlistData.wishlists}
                            pages={wishlistData.pages}
                            currentPage={wishlistData.currentPage}
                            endPage={wishlistData.endPage}
                            onPageChange={setWishlistPage}
                        />
                    )}
                    {activeTab === "score-history" && isLoaded && (
                        <ProfilePointHistoryTab />
                    )}
                    {activeTab === "arena" && isLoaded && <ProfileArenaTab />}
                </div>
            </div>
        </section>
    );
}
