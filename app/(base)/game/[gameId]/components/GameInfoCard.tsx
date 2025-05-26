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
        <div className="w-[300px] h-[330px] bg-background-100 rounded-[8px] p-4 pl-8 space-y-4">
            <h2 className="text-h2 font-medium text-font-100 line-clamp-1">
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
                value={wishCount.toLocaleString()}
            />
            <InfoRow
                icon="/icons/review.svg"
                label="리뷰"
                value={reviewCount.toLocaleString()}
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
        <div className="flex items-center h-9 gap-3">
            <Image src={icon} alt={label} width={20} height={20} />
            <div className="flex flex-col">
                <span className="text-regular text-font-100">{label}</span>
                <span className="text-caption text-font-200">{value}</span>
            </div>
        </div>
    );
}
