// components/profile/ProfileSummaryCard.tsx
"use client";

import Image from "next/image";

interface Props {
    reviewCount: number;
    wishlistCount: number;
    nickname: string;
    imageUrl: string;
    score: number;
    createdAt: string;
}

export default function ProfileSummaryCard({
    reviewCount,
    wishlistCount,
    nickname,
    imageUrl,
    score,
    createdAt,
}: Props) {
    return (
        <div className="bg-background-300 w-[250px] p-6 rounded-xl shadow">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden mx-auto mb-4">
                <Image
                    src={imageUrl || "/images/default.png"}
                    alt="프로필 이미지"
                    width={120}
                    height={120}
                />
            </div>
            <h2 className="text-center font-semibold text-body">{nickname}</h2>
            <p className="text-center text-caption text-font-200 mt-1">
                가입일: {createdAt}
            </p>
            <div className="mt-4 text-sm space-y-1">
                <p className="flex justify-between">
                    <span>포인트</span>
                    <span className="font-semibold">{score}</span>
                </p>
                <p className="flex justify-between">
                    <span>리뷰</span>
                    <span className="font-semibold">{reviewCount}</span>
                </p>
                <p className="flex justify-between">
                    <span>위시리스트</span>
                    <span className="font-semibold">{wishlistCount}</span>
                </p>
            </div>
        </div>
    );
}
