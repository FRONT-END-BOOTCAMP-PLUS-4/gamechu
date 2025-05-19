"use client";

import React from "react";
import Image from "next/image";
import Lottie from "lottie-react";
import Rio from "@/public/rio.json";
import { cn } from "@/utils/tailwindUtil";

interface ReviewSelectorProps {
    selected: "expert" | "user";
    onSelect: (type: "expert" | "user") => void;
}

export default function ReviewSelector({
    selected,
    onSelect,
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
                        ? "ring-2 ring-primary-purple-200"
                        : "opacity-70 hover:opacity-100"
                )}
            >
                {/* 내부 왼쪽 애니메이션 */}
                {isSelected && (
                    <div className="w-[120px] h-[120px]">
                        <Lottie animationData={Rio} loop autoplay />
                    </div>
                )}

                {/* 텍스트 정보 */}
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
                            {reviewCount.toLocaleString()} 리뷰
                        </span>
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div className="flex flex-col items-start gap-6">
            {renderBox("겜잘알 리뷰", "expert", 4.5, 1234)}
            {renderBox("일반 리뷰", "user", 4.3, 5678)}
        </div>
    );
}
