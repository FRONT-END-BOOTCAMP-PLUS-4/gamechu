import React from "react";
import Image from "next/image";

interface GameInfoCardProps {
    platform: string;
    genre: string;
    theme: string;
    wishCount: number;
    reviewCount: number;
}

export default function GameInfoCard({
    platform,
    genre,
    theme,
    wishCount,
    reviewCount,
}: GameInfoCardProps) {
    return (
        <div className="w-[300px] h-[330px] bg-background-100 rounded-[8px] p-4 pl-8 space-y-4">
            {/* 타이틀 */}
            <h2 className="text-h2 font-medium text-font-100 line-clamp-1">
                게임 정보
            </h2>

            {/* 플랫폼 */}
            <div className="flex items-center h-9 gap-3">
                <Image
                    src="/icons/platform.svg"
                    alt="platform"
                    width={20}
                    height={20}
                />
                <div className="flex flex-col">
                    <span className="text-regular text-font-100">플랫폼</span>
                    <span className="text-caption text-font-200">
                        {platform}
                    </span>
                </div>
            </div>

            {/* 장르 */}
            <div className="flex items-center h-9 gap-3">
                <Image
                    src="/icons/genre.svg"
                    alt="genre"
                    width={20}
                    height={20}
                />
                <div className="flex flex-col">
                    <span className="text-regular text-font-100">장르</span>
                    <span className="text-caption text-font-200">{genre}</span>
                </div>
            </div>

            {/* 테마 */}
            <div className="flex items-center h-9 gap-3">
                <Image
                    src="/icons/theme.svg"
                    alt="theme"
                    width={20}
                    height={20}
                />
                <div className="flex flex-col">
                    <span className="text-regular text-font-100">테마</span>
                    <span className="text-caption text-font-200">{theme}</span>
                </div>
            </div>

            {/* 위시 */}
            <div className="flex items-center h-9 gap-3">
                <Image
                    src="/icons/wish.svg"
                    alt="wish"
                    width={20}
                    height={20}
                />
                <div className="flex flex-col">
                    <span className="text-regular text-font-100">위시</span>
                    <span className="text-caption text-font-200">
                        {wishCount.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* 리뷰 */}
            <div className="flex items-center h-9 gap-3">
                <Image
                    src="/icons/review.svg"
                    alt="review"
                    width={20}
                    height={20}
                />
                <div className="flex flex-col">
                    <span className="text-regular text-font-100">리뷰</span>
                    <span className="text-caption text-font-200">
                        {reviewCount.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
