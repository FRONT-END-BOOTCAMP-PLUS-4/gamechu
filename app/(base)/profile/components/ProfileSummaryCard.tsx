// components/profile/ProfileSummaryCard.tsx
"use client";

import Image from "next/image";

export default function ProfileSummaryCard() {
    return (
        <div className="bg-background-300 w-[250px] p-6 rounded-xl shadow">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden mx-auto mb-4">
                <Image
                    src="/images/default.png"
                    alt="프로필 이미지"
                    width={120}
                    height={120}
                />
            </div>
            <h2 className="text-center font-semibold text-body">게임마스터94</h2>
            <p className="text-center text-caption text-font-200 mt-1">
                가입일: 2024년 5월 15일
            </p>
            <div className="mt-4 text-sm space-y-1">
                <p className="flex justify-between">
                    <span>포인트</span>
                    <span className="font-semibold">2500</span>
                </p>
                <p className="flex justify-between">
                    <span>리뷰</span>
                    <span className="font-semibold">24</span>
                </p>
                <p className="flex justify-between">
                    <span>위시리스트</span>
                    <span className="font-semibold">12</span>
                </p>
            </div>
        </div>
    );
}