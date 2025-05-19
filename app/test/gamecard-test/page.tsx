"use client";

import React, { useState } from "react";
import StarRating from "@/app/(base)/game/[id]/components/StarRating";
import GameInfoCard from "@/app/(base)/game/[id]/components/GameInfoCard";
import GameTitleCard from "@/app/(base)/game/[id]/components/GameTitleCard";
import ReviewSelector from "@/app/(base)/game/[id]/components/ReviewSelector";
import Comment from "@/app/(base)/game/[id]/components/Comment";
import CommentCard from "@/app/(base)/game/[id]/components/CommentCard";

export default function GameDetailTestPage() {
    const [rating, setRating] = useState(3.5);
    const [selectedReviewType, setSelectedReviewType] = useState<
        "expert" | "user"
    >("expert");

    return (
        <div className="min-h-screen bg-background-400 text-font-100 p-10">
            <h1 className="text-headline font-bold mb-6">
                ⭐️ 별점 컴포넌트 테스트
            </h1>

            <div className="space-y-6">
                {/* 기본 인터랙티브 별점 */}
                <div>
                    <p className="text-body mb-2">인터랙티브 별점:</p>
                    <StarRating value={rating} onChange={setRating} />
                    <p className="text-caption mt-2">현재 별점: {rating}</p>
                </div>

                {/* 읽기 전용 별점 */}
                <div>
                    <p className="text-body mb-2">읽기 전용 (예: 평균 별점):</p>
                    <StarRating value={4.5} readOnly />
                </div>
                <div>
                    <GameInfoCard
                        platform="PC, PS5, Switch"
                        genre="RPG, 액션, 어드벤처"
                        theme="공포, 판타지"
                        wishCount={12456}
                        reviewCount={1532}
                    />
                </div>
                <div className="space-y-6">
                    <GameTitleCard
                        image="https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg"
                        title="Hollow Knight"
                        developer="Team Cherry"
                        rating={4.8}
                        releaseDate="2024.12.12"
                    />
                </div>
                <div className="space-y-20">
                    <ReviewSelector
                        selected={selectedReviewType}
                        onSelect={setSelectedReviewType}
                    />
                </div>
                <div className="space-y-20">
                    <Comment />
                </div>
                <div className="space-y-20">
                    <CommentCard
                        profileImage="/icons/teamA.svg"
                        nickname="겜잘알 유저"
                        date="2025.05.19"
                        tier="/icons/platinum.svg"
                        rating={4.5}
                        comment="이 게임 진짜 재미있습니다! 전투 시스템이 굉장히 정교하고, 그래픽도 뛰어나서 몰입감이 최고예요. 특히 보스전은 긴장감 넘치고 도전 욕구를 자극합니다. 강추합니다!"
                        likes={123}
                    />
                </div>
            </div>
        </div>
    );
}
