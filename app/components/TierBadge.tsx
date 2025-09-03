// TierBadge.tsx 파일 (수정 제안)
"use client";

import Image from "next/image";
import { getTier } from "@/utils/GetTiers";

interface TierBadgeProps {
    score: number;
}

export default function TierBadge({ score }: TierBadgeProps) {
    const tier = getTier(score);

    return (
        <div
            className={
                "flex h-[32px] w-[30px] items-center justify-center gap-2 whitespace-nowrap rounded-full text-xs font-semibold sm:h-[32px] sm:w-[120px]"
            }
            style={{
                backgroundColor: `${tier.color}1A`,
                color: tier.color,
                border: `1px solid ${tier.color}33`,
            }}
        >
            <Image
                src={tier.icon}
                alt={`${tier.label} 배지`}
                width={18}
                height={18}
                className={"h-[24px] w-[24px] sm:h-[18px] sm:w-[18px]"}
            />
            <span className="hidden sm:inline">{tier.label}</span>
        </div>
    );
}
