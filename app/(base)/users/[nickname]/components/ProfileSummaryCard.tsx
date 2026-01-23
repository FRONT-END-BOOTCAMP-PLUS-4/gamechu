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
    nickname,
    imageUrl,
    score,
}: Props) {
    return (
        <div className="h-[270px] w-full rounded-xl bg-background-300 p-6 shadow md:w-[250px]">
            {/* 프로필 이미지 */}
            <div className="mx-auto mb-3 h-[120px] w-[120px] overflow-hidden rounded-full">
                <Image
                    src={imageUrl || "/icons/arena.svg"}
                    alt="프로필 이미지"
                    width={120}
                    height={120}
                />
            </div>

            {/* 닉네임 */}
            <h2 className="mt-1 min-h-[24px] text-center text-body font-semibold">
                {nickname || (
                    <span className="text-font-200">닉네임 불러오는 중</span>
                )}
            </h2>

            {/* 포인트 / 리뷰 */}
            <div className="mt-4 space-y-1 text-sm">
                <p className="flex min-h-[20px] justify-between">
                    <span>포인트</span>
                    <span className="font-semibold">
                        {score !== undefined ? score : "-"}
                    </span>
                </p>
                <p className="flex min-h-[20px] justify-between">
                    <span>리뷰</span>
                    <span className="font-semibold">
                        {reviewCount !== undefined ? reviewCount : "-"}
                    </span>
                </p>
            </div>
        </div>
    );
}
