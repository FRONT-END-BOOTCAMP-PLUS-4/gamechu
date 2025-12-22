// ✅ components/profile/ProfileTierCard.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import TierBadge from "@/app/components/TierBadge";
import { tiers, Tier } from "@/constants/tiers";
import { getTier } from "@/utils/GetTiers";
import PointHelpModal from "./PointHelpModal";

type Props = {
    score: number;
};

export default function ProfileTierCard({ score }: Props) {
    const [isHelpOpen, setIsHelpOpen] = useState(false);

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

    useEffect(() => {
        if (isHelpOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [isHelpOpen]);

    return (
        <div className="h-[320px] w-full flex-1 rounded-xl bg-background-300 p-6 shadow">
            {/* 제목 & 설명 */}
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h2 className="text-body font-semibold">나의 티어</h2>

                    {/* ✅ 설명 + ? 버튼 */}
                    <div className="mt-1 flex items-center gap-2">
                        <p className="text-sm text-font-200">
                            포인트를 모아 더 높은 티어로 승급하세요!
                        </p>

                        <button
                            type="button"
                            onClick={() => setIsHelpOpen(true)}
                            className="focus:ring-primary/60 inline-flex h-6 w-6 items-center justify-center rounded-full border border-background-200 bg-background-200 text-xs font-bold text-font-100 hover:opacity-90 focus:outline-none focus:ring-2"
                            aria-label="포인트 안내 보기"
                            aria-haspopup="dialog"
                            aria-expanded={isHelpOpen}
                            aria-controls="tier-point-help-modal"
                            title="포인트 안내"
                        >
                            ?
                        </button>
                    </div>
                </div>

                {/* 우측 배지 */}
                <div className="block md:hidden">
                    <TierBadge score={score} />
                </div>
                <div className="hidden md:block">
                    <TierBadge score={score} />
                </div>
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

            {/* ✅ 모바일: 현재 티어만 */}
            <div className="grid grid-cols-1 gap-2 text-center text-caption md:hidden">
                <div
                    className="flex flex-col items-center rounded-xl border px-4 py-4 font-bold text-white"
                    style={{
                        backgroundColor: `${currentTier.color}22`,
                        border: `2px solid ${currentTier.color}`,
                    }}
                >
                    <Image
                        src={currentTier.icon}
                        alt={currentTier.label}
                        width={24}
                        height={24}
                        className="mb-1 brightness-[1.5]"
                    />
                    <div className="text-sm">{currentTier.label}</div>
                    <div className="text-xs">
                        {currentTier.max === Infinity
                            ? `${currentTier.min}+`
                            : `${currentTier.min} - ${currentTier.max}`}
                    </div>
                </div>
            </div>

            {/* ✅ 태블릿 */}
            <div className="hidden grid-cols-5 gap-2 text-center text-caption md:grid lg:hidden">
                {tiers.map((tier) => {
                    const isActive = tier.label === currentTier.label;
                    return (
                        <div
                            key={tier.label}
                            className={`flex min-w-0 flex-col items-center rounded-xl border px-3 py-4 transition-all duration-300 ${
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
                                width={22}
                                height={22}
                                className={`${isActive ? "brightness-[1.5]" : "opacity-70"} mb-1`}
                            />
                            <div className="truncate text-xs sm:text-sm">
                                {tier.label}
                            </div>
                            <div className="hidden text-[10px]" />
                        </div>
                    );
                })}
            </div>

            {/* ✅ 데스크탑 */}
            <div className="grid hidden grid-cols-5 gap-3 text-center text-caption lg:grid">
                {tiers.map((tier) => {
                    const isActive = tier.label === currentTier.label;
                    return (
                        <div
                            key={tier.label}
                            className={`flex min-w-0 flex-col items-center rounded-xl border px-4 py-6 transition-all duration-300 ${
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
                                className={`${isActive ? "brightness-[1.5]" : "opacity-70"} mb-1`}
                            />
                            <div className="text-sm">{tier.label}</div>
                            <div className="text-xs">
                                {tier.max === Infinity
                                    ? `${tier.min}+`
                                    : `${tier.min} - ${tier.max}`}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ✅ 모달 */}
            <PointHelpModal
                open={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
            />
        </div>
    );
}
