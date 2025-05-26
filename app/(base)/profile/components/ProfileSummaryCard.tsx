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
        <div className="bg-background-300 w-[250px] h-[320px] p-6 rounded-xl shadow">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden mx-auto mb-4">
                <Image
                    src={imageUrl || "/icons/arena.svg"}
                    alt="프로필 이미지"
                    width={120}
                    height={120}
                />
            </div>
            <h2 className="text-center font-semibold text-body min-h-[24px]">
                {nickname || <span className="text-font-200">닉네임 불러오는 중</span>}
            </h2>
            <p className="text-center text-caption text-font-200 mt-1 min-h-[20px]">
                가입일: {createdAt || "-"}
            </p>
            <div className="mt-4 text-sm space-y-1">
                <p className="flex justify-between min-h-[20px]">
                    <span>포인트</span>
                    <span className="font-semibold">
                        {score !== undefined ? score : "-"}
                    </span>
                </p>
                <p className="flex justify-between min-h-[20px]">
                    <span>리뷰</span>
                    <span className="font-semibold">
                        {reviewCount !== undefined ? reviewCount : "-"}
                    </span>
                </p>
                <p className="flex justify-between min-h-[20px]">
                    <span>위시리스트</span>
                    <span className="font-semibold">
                        {wishlistCount !== undefined ? wishlistCount : "-"}
                    </span>
                </p>
            </div>
        </div>
    );
}
