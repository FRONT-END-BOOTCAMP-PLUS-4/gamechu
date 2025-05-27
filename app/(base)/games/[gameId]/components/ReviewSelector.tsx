"use client";

import React from "react";
import Image from "next/image";
import Lottie from "lottie-react";
import Rio from "@/public/rio.json";
import { cn } from "@/utils/tailwindUtil";

interface ReviewSelectorProps {
    selected: "expert" | "user";
    onSelect: (type: "expert" | "user") => void;
    expertReviewCount: number;
    expertAvgRating: number;
    userReviewCount: number;
    userAvgRating: number;
}

export default function ReviewSelector({
    selected,
    onSelect,
    expertReviewCount,
    expertAvgRating,
    userReviewCount,
    userAvgRating,
}: ReviewSelectorProps) {
    const renderBox = (
        label: string,
        type: "expert" | "user",
        rating: number,
        reviewCount: number
    ) => {
        const isSelected = selected === type;

        return (
            <button
                onClick={() => onSelect(type)}
                className={cn(
                    "w-[300px] h-[200px] rounded-lg px-4 py-6 flex items-center justify-center gap-3 text-font-100 border border-line-200 transition-all",
                    isSelected
                        ? "border-2 border-primary-purple-200"
                        : "opacity-70 hover:opacity-100"
                )}
            >
                {isSelected && (
                    <div className="w-[120px] h-[120px]">
                        <Lottie animationData={Rio} loop autoplay />
                    </div>
                )}

                <div className="flex flex-col items-start gap-2">
                    <h2 className="text-h2 font-semibold">{label}</h2>

                    <div className="flex items-center gap-2">
                        <Image
                            src="/icons/empty-purple-star.svg"
                            alt="별"
                            width={20}
                            height={20}
                        />
                        <span className="text-regular font-medium">
                            {rating.toFixed(1)} / 5.0
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Image
                            src="/icons/review.svg"
                            alt="리뷰"
                            width={20}
                            height={20}
                        />
                        <span className="text-regular font-medium">
                            {reviewCount.toLocaleString()}
                        </span>
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div className="flex flex-col items-start gap-6">
            {renderBox(
                "겜잘알 리뷰",
                "expert",
                expertAvgRating,
                expertReviewCount
            )}
            {renderBox("일반 리뷰", "user", userAvgRating, userReviewCount)}
        </div>
    );
}
