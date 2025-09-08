"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/utils/tailwindUtil";

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readOnly?: boolean;
    variant?: "withText" | "noText";
}

export default function StarRating({
    value,
    onChange,
    readOnly = false,
    variant = "withText",
}: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const getStarType = (index: number) => {
        const currentValue = hoverValue ?? value;
        if (currentValue >= index + 1) return "full";
        if (currentValue >= index + 0.5) return "half";
        return "empty";
    };

    const displayValue = hoverValue ?? value;

    return (
        <div
            className={cn(
                "flex flex-col items-center gap-2",
                variant === "noText" && "gap-0"
            )}
        >
            {/* ✅ 텍스트 표시 여부 */}
            {variant === "withText" && (
                <div className="text-h2 font-medium text-font-100">
                    {displayValue.toFixed(1)} / 5.0
                </div>
            )}

            <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "relative h-[30px] w-[30px] cursor-pointer",
                            readOnly && "cursor-default"
                        )}
                        onMouseEnter={() => !readOnly && setHoverValue(i + 1)}
                        onMouseMove={(e) => {
                            if (readOnly) return;
                            const rect =
                                e.currentTarget.getBoundingClientRect();
                            const isHalf =
                                e.clientX - rect.left < rect.width / 2;
                            setHoverValue(i + (isHalf ? 0.5 : 1));
                        }}
                        onMouseLeave={() => !readOnly && setHoverValue(null)}
                        onClick={(e) => {
                            if (readOnly || !onChange) return;

                            const rect =
                                e.currentTarget.getBoundingClientRect();
                            const isHalf =
                                e.clientX - rect.left < rect.width / 2;
                            const newValue = i + (isHalf ? 0.5 : 1);
                            onChange(newValue);
                        }}
                    >
                        {getStarType(i) === "full" && (
                            <Image
                                src="/icons/purple-star.svg"
                                alt="full"
                                fill
                                className="object-contain"
                            />
                        )}
                        {getStarType(i) === "half" && (
                            <div className="relative h-full w-full">
                                <Image
                                    src="/icons/purple-star.svg"
                                    alt="half"
                                    fill
                                    className="clip-half object-contain"
                                />
                                <Image
                                    src="/icons/empty-purple-star.svg"
                                    alt="empty"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        )}
                        {getStarType(i) === "empty" && (
                            <Image
                                src="/icons/empty-purple-star.svg"
                                alt="empty"
                                fill
                                className="object-contain"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
