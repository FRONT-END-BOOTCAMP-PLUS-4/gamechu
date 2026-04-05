"use client";

import { useState, use, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/Fetcher";
import { queryKeys } from "@/lib/QueryKeys";
import ProfileSummaryCard from "../components/ProfileSummaryCard";
import ProfileTierCard from "../components/ProfileTierCard";
import ProfileSidebar from "../components/ProfileSidebar";
import ProfileReviewTab from "../components/tabs/ProfileReviewTab";
import ProfileArenaTab from "./components/tab/ProfileArenaTab";
import { useLoadingStore } from "@/stores/LoadingStore";
import { useRouter } from "next/navigation";

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

type UserProfile = {
    id: string;
    nickname: string;
    imageUrl: string;
    score: number;
};

export default function ProfilePage({
    params,
}: {
    params: Promise<{ nickname: string }>;
}) {
    const router = useRouter();
    const { nickname: routeNickname } = use(params);
    const { setLoading } = useLoadingStore();
    const [activeTab, setActiveTab] = useState("reviews");

    const {
        data: profile,
        isLoading: profileLoading,
        isError: profileError,
    } = useQuery<UserProfile>({
        queryKey: queryKeys.userProfile(routeNickname),
        queryFn: () => fetcher(`/api/member/profile/${routeNickname}`),
    });

    const memberId = profile?.id ?? null;

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
        queryKey: queryKeys.reviewsByMember(memberId!),
        queryFn: () => fetcher(`/api/reviews/member/${memberId}`),
        enabled: !!memberId,
    });

    const isLoading = profileLoading || reviewsLoading;

    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading, setLoading]);

    useEffect(() => {
        if (profileError) {
            router.replace("/not-found");
        }
    }, [profileError, router]);

    const nickname = profile?.nickname ?? "";
    const imageUrl = profile?.imageUrl ?? "/icons/arena.svg";
    const score = profile?.score ?? 0;
    const reviewCount = reviews.length;
    const isLoaded = !isLoading && !!profile;

    return (
        <section className="min-h-screen w-full bg-background-400 px-4 py-4 font-sans text-font-100 md:px-10 md:py-10">
            {/* 상단 카드 영역 */}
            <div className="mb-10 flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-10">
                <ProfileSummaryCard
                    isOwnProfile={false}
                    reviewCount={reviewCount}
                    nickname={nickname}
                    imageUrl={imageUrl}
                    score={score}
                />
                <ProfileTierCard isOwnProfile={false} score={score} />
            </div>

            {/* 본문 */}
            <div className="flex flex-col md:flex-row md:items-start md:space-x-10">
                {/* 사이드바 */}
                <div className="mb-6 w-full md:mb-0 md:w-[250px]">
                    <ProfileSidebar isOwnProfile={false} onSelect={setActiveTab} />
                </div>

                {/* 컨텐츠 영역 */}
                <div className="w-full min-w-0 flex-1">
                    {activeTab === "reviews" && isLoaded && (
                        <ProfileReviewTab reviews={reviews} />
                    )}

                    {activeTab === "arena" && isLoaded && memberId && (
                        <ProfileArenaTab memberId={memberId} />
                    )}
                </div>
            </div>
        </section>
    );
}
