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
        // ✅ 카드 자체도 min-w-0; 부모가 줄어들면 같이 줄도록
        <div className="w-full min-w-0 rounded-md bg-background-200 p-4 shadow md:p-5">
            {/* 내부는 리뷰 아이템처럼 좌:1fr / 우:auto 구조로 */}
            <div className="grid min-w-0 grid-cols-[1fr_auto] gap-3">
                {/* 왼쪽: 아이콘 + 텍스트 */}
                <div className="flex min-w-0 items-start gap-3 md:gap-4">
                    <Image
                        src={imageUrl}
                        alt={policyName}
                        width={32}
                        height={32}
                        className="mt-1 flex-shrink-0 md:h-9 md:w-9"
                    />
                    {/* ✅ 텍스트 래퍼 */}
                    <div className="flex min-w-0 flex-col justify-center">
                        <h3 className="truncate text-base font-bold text-font-100">
                            {policyName}
                        </h3>
                        {/* 데스크톱에서만 노출하되, 한 줄로 줄임 처리 */}
                        <p className="text-font-300 mt-1 hidden truncate text-sm md:mt-2 md:block">
                            {description}
                        </p>
                    </div>
                </div>

                {/* 오른쪽: 점수 + 날짜 (자연스럽게 내용 고정 폭) */}
                <div className="flex flex-col items-end justify-between">
                    <span
                        className={clsx(
                            "font-bold",
                            "text-base md:text-lg",
                            scoreColor
                        )}
                    >
                        {formattedScore}
                    </span>
                    <span className="text-font-300 pt-1 text-[11px] md:pt-2 md:text-xs">
                        {formattedDate}
                    </span>
                </div>
            </div>
        </div>
    );
}
