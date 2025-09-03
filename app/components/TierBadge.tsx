// ✅ components/profile/TierBadge.tsx
"use client";

import Image from "next/image";
import { getTier } from "@/utils/GetTiers";

interface TierBadgeProps {
    score: number;
    size?: "sm" | "md" | "lg";
}

export default function TierBadge({ score, size = "md" }: TierBadgeProps) {
    const tier = getTier(score);

    const sizeStyles = {
        sm: {
            width: "w-[80px]",
            height: "h-[28px]",
            icon: 14,
            textSize: "text-xs",
            iconClass: "w-[14px] h-[14px]",
        },
        md: {
            width: "w-[100px]",
            height: "h-[32px]",
            icon: 18,
            textSize: "text-sm",
            iconClass: "w-[18px] h-[18px]",
        },
        lg: {
            width: "w-[120px]",
            height: "h-[36px]",
            icon: 22,
            textSize: "text-base",
            iconClass: "w-[22px] h-[22px]",
        },
    }[size];

    return (
        <div
            className={`flex items-center justify-center gap-2 ${sizeStyles.width} ${sizeStyles.height} rounded-full font-semibold ${sizeStyles.textSize}`}
            style={{
                backgroundColor: `${tier.color}1A`,
                color: tier.color,
                border: `1px solid ${tier.color}33`,
            }}
        >
            <Image
                src={tier.icon}
                alt={`${tier.label} 배지`}
                width={sizeStyles.icon}
                height={sizeStyles.icon}
                className={sizeStyles.iconClass}
            />
            <span>{tier.label}</span>
        </div>
    );
}
