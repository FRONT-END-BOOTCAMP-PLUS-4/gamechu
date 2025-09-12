import React from "react";
import Image from "next/image";

interface GameInfoCardProps {
    platforms: string[];
    genres: string[];
    themes: string[];
    wishCount: number;
    reviewCount: number;
}

export default function GameInfoCard({
    platforms,
    genres,
    themes,
    wishCount,
    reviewCount,
}: GameInfoCardProps) {
    const display = (arr: string[]) => arr.slice(0, 2).join(", ");

    return (
        <div className="w-full space-y-6 p-4 lg:h-[330px] lg:space-y-4">
            <h2 className="line-clamp-1 text-lg font-semibold text-font-100 lg:text-h2">
                게임 정보
            </h2>

            <InfoRow
                icon="/icons/platform.svg"
                label="플랫폼"
                value={display(platforms)}
            />
            <InfoRow
                icon="/icons/genre.svg"
                label="장르"
                value={display(genres)}
            />
            <InfoRow
                icon="/icons/theme.svg"
                label="테마"
                value={display(themes)}
            />
            <InfoRow
                icon="/icons/wish.svg"
                label="위시"
                value={
                    typeof wishCount === "number"
                        ? wishCount.toLocaleString()
                        : "0"
                }
            />
            <InfoRow
                icon="/icons/review.svg"
                label="리뷰"
                value={
                    typeof reviewCount === "number"
                        ? reviewCount.toLocaleString()
                        : "0"
                }
            />
        </div>
    );
}

function InfoRow({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) {
    return (
        <div className="flex h-9 items-center gap-3">
            <Image src={icon} alt={label} width={20} height={20} />
            <div className="flex flex-col">
                <span className="text-regular text-font-100">{label}</span>
                <span className="text-caption text-font-200">{value}</span>
            </div>
        </div>
    );
}
