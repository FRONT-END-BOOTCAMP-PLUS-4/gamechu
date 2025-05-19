"use client";

import React, { useState } from "react";
import StarRating from "@/app/(base)/game/[id]/components/StarRating";
import GameInfoCard from "@/app/(base)/game/[id]/components/GameInfoCard";

export default function GameDetailTestPage() {
    const [rating, setRating] = useState(3.5);

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
            </div>
        </div>
    );
}
