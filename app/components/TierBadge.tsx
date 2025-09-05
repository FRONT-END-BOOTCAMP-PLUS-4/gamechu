"use client";

import Image from "next/image";
import { getTier } from "@/utils/GetTiers";

interface TierBadgeProps {
    score: number;
    iconOnly?: boolean; // ✅ 아이콘만 출력할지 여부
}

export default function TierBadge({ score, iconOnly = false }: TierBadgeProps) {
    const tier = getTier(score);

    return (
        <div
            className={
                iconOnly
                    ? // ✅ 아이콘만 모드
                      "flex h-[32px] w-[32px] items-center justify-center rounded-full"
                    : // ✅ 기존 모드 (아이콘 + 라벨)
                      "flex h-[32px] w-[30px] items-center justify-center gap-2 whitespace-nowrap rounded-full text-xs font-semibold sm:h-[32px] sm:w-[120px]"
            }
            style={{
                backgroundColor: `${tier.color}1A`,
                color: tier.color,
                border: `1px solid ${tier.color}33`,
            }}
        >
            {/* 아이콘은 항상 출력 */}
            <Image
                src={tier.icon}
                alt={`${tier.label} 배지`}
                width={18}
                height={18}
                className={
                    iconOnly
                        ? "h-[24px] w-[24px]" // 아이콘만 모드에서는 조금 크게
                        : "h-[24px] w-[24px] sm:h-[18px] sm:w-[18px]"
                }
            />

            {/* iconOnly가 아닐 때만 라벨 출력 */}
            {!iconOnly && (
                <span className="hidden sm:inline">{tier.label}</span>
            )}
        </div>
    );
}
