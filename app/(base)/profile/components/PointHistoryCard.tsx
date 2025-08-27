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
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const formattedScore = `${score > 0 ? "+" : ""}${score}`;
    const scoreColor = score >= 0 ? "text-primary-purple-200" : "text-red-500";

    return (
        <div className="relative flex items-stretch justify-between rounded-md bg-background-200 p-4 shadow min-[821px]:p-5">
            {/* 왼쪽: 아이콘 + 텍스트 */}
            <div className="flex min-w-0 items-start gap-3 min-[821px]:gap-4">
                <Image
                    src={`${imageUrl}`}
                    alt={policyName}
                    width={32}
                    height={32}
                    className="mt-1 flex-shrink-0 min-[821px]:h-9 min-[821px]:w-9"
                />
                <div className="flex min-w-0 flex-col justify-center">
                    <h3 className="line-clamp-1 text-base font-bold text-font-100">
                        {policyName}
                    </h3>
                    {/* 모바일 숨김, 데스크탑은 제목과 간격 더 띄움 */}
                    <p className="text-font-300 mt-1 hidden text-sm min-[821px]:mt-2 min-[821px]:block">
                        {description}
                    </p>
                </div>
            </div>

            {/* 오른쪽: 점수(상단) + 날짜(하단 고정) */}
            <div className="ml-3 flex flex-col items-end">
                <span
                    className={clsx(
                        "font-bold",
                        "text-base min-[821px]:text-lg",
                        scoreColor
                    )}
                >
                    {formattedScore}
                </span>
                {/* ✅ 항상 우측 하단에 위치 */}
                <span className="text-font-300 mt-auto pt-1 text-[11px] min-[821px]:pt-2 min-[821px]:text-xs">
                    {formattedDate}
                </span>
            </div>
        </div>
    );
}
