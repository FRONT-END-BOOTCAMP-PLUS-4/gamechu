// ✅ components/profile/ProfileTierCard.tsx
"use client";

import Image from "next/image";
import TierBadge from "@/app/components/TierBadge";
import { tiers, Tier } from "@/constants/tiers";
import { getTier } from "@/utils/GetTiers";

type Props = {
    score: number;
};

export default function ProfileTierCard({ score }: Props) {
    const currentTier: Tier = getTier(score);
    const currentIndex = tiers.indexOf(currentTier);
    const nextTier = tiers[Math.min(currentIndex + 1, tiers.length - 1)];
    const progress =
        currentTier.max === Infinity
            ? 100
            : ((score - currentTier.min) /
                  (currentTier.max - currentTier.min)) *
              100;
    const pointsToNext =
        currentTier.max === Infinity ? 0 : Math.max(0, nextTier.min - score);

    return (
        <div className="h-[320px] flex-1 rounded-xl bg-background-300 p-6 shadow">
            {/* 제목 & 설명 */}
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h2 className="text-body font-semibold">나의 티어</h2>
                    <p className="text-sm text-font-200">
                        포인트를 모아 더 높은 티어로 승급하세요!
                    </p>
                </div>

                {/* 우측 배지 */}
                <TierBadge score={score} />
            </div>

            <p className="text-sm font-semibold">
                현재 포인트: {score.toString()}
            </p>

            {/* 다음 티어까지 */}
            <p className="mb-1 text-right text-caption text-font-200">
                {currentTier.max === Infinity
                    ? "최고 티어입니다!"
                    : `다음 티어까지: ${pointsToNext.toString()} 포인트`}
            </p>

            {/* 프로그레스 바 */}
            <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-background-200">
                <div
                    className="h-full transition-all duration-700 ease-out"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: currentTier.color,
                    }}
                />
            </div>

            {/* 티어 카드 리스트 */}
            <div className="grid grid-cols-5 gap-3 text-center text-caption">
                {tiers.map((tier) => {
                    const isActive = tier.label === currentTier.label;
                    return (
                        <div
                            key={tier.label}
                            className={`flex flex-col items-center rounded-xl border px-4 py-6 transition-all duration-300 ${
                                isActive
                                    ? "font-bold text-white"
                                    : "text-font-200"
                            }`}
                            style={{
                                backgroundColor: isActive
                                    ? `${tier.color}22`
                                    : "#1e1e1e",
                                border: isActive
                                    ? `2px solid ${tier.color}`
                                    : "1px solid #333",
                            }}
                        >
                            <Image
                                src={tier.icon}
                                alt={tier.label}
                                width={24}
                                height={24}
                                className={`mb-1 ${
                                    isActive ? "brightness-[1.5]" : "opacity-70"
                                }`}
                            />
                            <div className="text-sm">{tier.label}</div>
                            <div className="text-xs">
                                {tier.max === Infinity
                                    ? `${tier.min.toString()}+`
                                    : `${tier.min.toString()} - ${tier.max.toString()}`}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
