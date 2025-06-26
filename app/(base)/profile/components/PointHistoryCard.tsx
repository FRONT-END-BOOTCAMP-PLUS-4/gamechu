"use client";

import Image from "next/image";
import clsx from "clsx";

interface PointHistoryCardProps {
    policyName: string;
    description: string;
    score: number;
    imageUrl: string;
    createdAt: string;
}

export default function PointHistoryCard({
    policyName,
    description,
    score,
    imageUrl,
    createdAt,
}: PointHistoryCardProps) {
    const formattedDate = new Date(createdAt).toLocaleDateString("ko-KR", {
        timeZone: "Asia/Seoul", // ✅ 한국 시간 적용
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const formattedScore = `${score > 0 ? "+" : ""}${score}`;
    const scoreColor = score >= 0 ? "text-primary-purple-200" : "text-red-500";

    return (
        <div className="relative bg-background-200 rounded-md p-5 shadow flex justify-between items-start">
            {/* 왼쪽: 아이콘 + 텍스트 */}
            <div className="flex items-start gap-4">
                <Image
                    src={`/${imageUrl}`}
                    alt={policyName}
                    width={36}
                    height={36}
                    className="flex-shrink-0 mt-1"
                />
                <div className="flex flex-col justify-center">
                    <h3 className="text-font-100 text-base font-bold">
                        {policyName}
                    </h3>
                    <p className="text-font-300 text-sm mt-1">{description}</p>
                </div>
            </div>

            {/* 오른쪽: 점수 및 날짜 */}
            <div className="flex flex-col items-end justify-between h-full">
                <span className={clsx("text-lg font-bold", scoreColor)}>
                    {formattedScore}
                </span>
                <span className="text-xs text-font-300 mt-2">
                    {formattedDate}
                </span>
            </div>
        </div>
    );
}
