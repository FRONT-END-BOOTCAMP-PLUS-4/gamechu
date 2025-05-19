"use client";

import React, { useState } from "react";
import GameTitleCard from "./components/GameTitleCard";
import GameInfoCard from "./components/GameInfoCard";
import ReviewSelector from "./components/ReviewSelector";
import Comment from "./components/Comment";
import CommentCard from "./components/CommentCard";
import Pager from "@/app/components/Pager";

const dummyComments = [
    {
        profileImage: "/icons/profile.svg",
        nickname: "겜돌이",
        date: "2025.05.19",
        tier: "/icons/silver.svg",
        rating: 4.5,
        comment: "정말 재밌는 게임이었습니다!",
        likes: 24,
    },
    {
        profileImage: "/icons/bronze.svg",
        nickname: "일반유저",
        date: "2025.05.18",
        tier: "/icons/gold.svg",
        rating: 3.8,
        comment: "그럭저럭 할만했어요.",
        likes: 10,
    },
    {
        profileImage: "/icons/profile.svg",
        nickname: "겜돌이",
        date: "2025.05.19",
        tier: "/icons/platinum.svg",
        rating: 4.5,
        comment: "정말 재밌는 게임이었습니다!",
        likes: 24,
    },
    {
        profileImage: "/icons/bronze.svg",
        nickname: "일반유저",
        date: "2025.05.18",
        tier: "/icons/gold.svg",
        rating: 3.8,
        comment: "그럭저럭 할만했어요.",
        likes: 10,
    },
    {
        profileImage: "/icons/profile.svg",
        nickname: "겜돌이",
        date: "2025.05.19",
        tier: "/icons/platinum.svg",
        rating: 4.5,
        comment: "정말 재밌는 게임이었습니다!",
        likes: 24,
    },
    {
        profileImage: "/icons/bronze.svg",
        nickname: "일반유저",
        date: "2025.05.18",
        tier: "/icons/gold.svg",
        rating: 3.8,
        comment: "그럭저럭 할만했어요.",
        likes: 10,
    },
    {
        profileImage: "/icons/profile.svg",
        nickname: "겜돌이",
        date: "2025.05.19",
        tier: "/icons/platinum.svg",
        rating: 4.5,
        comment:
            "정말 재밌는재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말 게임이었습니다!정말 재밌는 게임이었습니다!정말이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말 재밌는 게임이었니이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말 재밌는 게임이었니이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 말 재밌는 게임이 재밌는 말 재밌는 게임이었니밌는 말 재밌는 게임이 재밌는 말 재밌는 게임이었니다!정말 재밌는 말 재밌는 게임이 재밌는 말 재밌는 게임이었습니다!정니다!정말 재밌는 말 재밌는 게임이 재밌는 말 재밌는 게임이었습니다!정니다!정말 재밌는 말 재밌는 게임이 재밌는 말 재밌는 게임이었습니다!정습니다!정말 재밌는말 재밌 재밌는 말 재밌는 게임이었습니다!정말 재밌는말 재밌 재밌는 말 재밌는 게임이었습니다!정말 재밌는말 재밌었습니다!정말 재밌는말 재밌는 게임이었습니다!정말 재밌는말 재밌는 게임이었습니다!정말 재밌는게임이었습니다!정말 재밌는 게임이었습니습니다!정말 재밌는 게임이었습니습니다!정말 재밌는 게임이었습니다!정말 재는 게임이었습니다!정말 재밌는 다!정말 재는 게임이었습니다!정말 재밌는 다!정말 재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 게임이었습니다!정말 재밌는 게임이었습니다!습니다!정말 재밌는 게임이었습니다!정말 재는 게임이었습니다!정말 재밌는 습니다!정말 재밌는 게임이었습니다!정말 재는 게임이었습니다!정말 재밌는 ",
        likes: 24,
    },
    {
        profileImage: "/icons/bronze.svg",
        nickname: "유저",
        date: "2025.05.18",
        tier: "/icons/silver.svg",
        rating: 3.8,
        comment: "그럭저럭 할만했어요.",
        likes: 10,
    },
    {
        profileImage: "/icons/profile.svg",
        nickname: "겜돌이",
        date: "2025.05.19",
        tier: "/icons/platinum.svg",
        rating: 4.5,
        comment: "정말 재밌는 게임이었습니다!",
        likes: 24,
    },
    {
        profileImage: "/icons/bronze.svg",
        nickname: "일반유저",
        date: "2025.05.18",
        tier: "/icons/gold.svg",
        rating: 3.8,
        comment: "그럭저럭 할만했어요.",
        likes: 10,
    },
    {
        profileImage: "/icons/profile.svg",
        nickname: "겜돌이",
        date: "2025.05.19",
        tier: "/icons/platinum.svg",
        rating: 4.5,
        comment: "정말 재밌는 게임이었습니다!",
        likes: 24,
    },
    {
        profileImage: "/icons/bronze.svg",
        nickname: "일반유저",
        date: "2025.05.18",
        tier: "/icons/gold.svg",
        rating: 3.8,
        comment: "그럭저럭 할만했어요.",
        likes: 10,
    },
];

const isExpertTier = (tier: string) => {
    const expertTiers = ["/icons/platinum.svg", "/icons/diamond.svg"];
    return expertTiers.includes(tier);
};

export default function GameDetailPage() {
    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReviewType, setSelectedReviewType] = useState<
        "expert" | "user"
    >("expert");

    const expertComments = dummyComments.filter((c) => isExpertTier(c.tier));
    const userComments = dummyComments.filter((c) => !isExpertTier(c.tier));
    const currentComments =
        selectedReviewType === "expert" ? expertComments : userComments;

    const totalItems = currentComments.length;
    const endPage = Math.ceil(totalItems / itemsPerPage);
    const pages = Array.from({ length: endPage }, (_, i) => i + 1);
    const commentsForPage = currentComments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-background-400 text-font-100 space-y-20 pb-10">
            {/* 상단 영역 */}
            <div className="flex w-[1400px] mx-auto justify-between gap-6 px-10 pt-20 ">
                <GameTitleCard
                    image="https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg"
                    title="Zelda: Tears of the Kingdom"
                    developer="Nintendo"
                    rating={4.8}
                    releaseDate="2024.12.12"
                />
                <GameInfoCard
                    platform="PC, PS5, Switch"
                    genre="RPG, 액션, 어드벤처"
                    theme="공포, 판타지"
                    wishCount={12456}
                    reviewCount={1532}
                />
            </div>

            {/* 하단 영역 */}
            <div className="w-full bg-black-300 ">
                <div className="flex w-full max-w-[1400px] mx-auto gap-6 px-10 items-start">
                    {/* 왼쪽 리뷰 선택 */}
                    <ReviewSelector
                        selected={selectedReviewType}
                        onSelect={setSelectedReviewType}
                    />

                    {/* 오른쪽 댓글 */}
                    <div className="flex-1 space-y-10">
                        <Comment />
                        <div className="space-y-6">
                            {commentsForPage.map((c, i) => (
                                <CommentCard key={i} {...c} />
                            ))}
                        </div>
                        <Pager
                            currentPage={currentPage}
                            pages={pages}
                            endPage={endPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
