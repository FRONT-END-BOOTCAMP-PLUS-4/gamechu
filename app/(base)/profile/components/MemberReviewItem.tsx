"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export interface MemberReviewItemProps {
    id: number;
    gameId: number;
    content: string;
    rating: number;
    createdAt: string;
    updatedAt: string | null;
    gameTitle: string;
    imageUrl: string | null;
}

export default function MemberReviewItem(review: MemberReviewItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const contentRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;

        const checkOverflow = () => {
            const hasOverflow = el.scrollHeight > el.clientHeight;
            setIsOverflowing(hasOverflow);
        };

        checkOverflow();
        window.addEventListener("resize", checkOverflow);
        return () => window.removeEventListener("resize", checkOverflow);
    }, [review.content]);

    return (
        <li className="relative flex gap-4 rounded-lg bg-background-200 p-4 shadow">
            {/* 게임 이미지 → 상세 페이지 링크 */}
            <Link href={`/games/${review.gameId}`}>
                <div className="h-[80px] w-[80px] flex-shrink-0 cursor-pointer overflow-hidden rounded">
                    <Image
                        src={
                            review.imageUrl?.startsWith("//")
                                ? `https:${review.imageUrl}`
                                : review.imageUrl || "/images/default-game.png"
                        }
                        alt={review.gameTitle}
                        width={80}
                        height={80}
                        className="rounded object-cover"
                    />
                </div>
            </Link>

            {/* 텍스트 콘텐츠 */}
            <div className="relative flex flex-1 flex-col gap-2">
                {/* 제목 + 별점 영역 */}
                <div className="grid grid-cols-[1fr_auto] items-start gap-2">
                    {/* 게임 제목 */}
                    <Link href={`/games/${review.gameId}`} className="min-w-0">
                        <h3
                            className="truncate text-body text-sm font-semibold hover:underline"
                            title={review.gameTitle}
                        >
                            {review.gameTitle}
                        </h3>
                    </Link>

                    {/* 별점 */}
                    <div className="flex items-center gap-1 justify-self-end whitespace-nowrap">
                        <Image
                            src="/icons/purple-star.svg"
                            alt="별점 아이콘"
                            width={16}
                            height={16}
                        />
                        <span className="text-sm font-semibold tabular-nums text-purple-500">
                            {(review.rating / 2).toFixed(1)}
                        </span>
                    </div>
                </div>
                {/* 리뷰 내용 */}
                <p
                    ref={contentRef}
                    className={`text-sm text-font-200 ${
                        isExpanded ? "" : "line-clamp-1"
                    }`}
                >
                    {review.content}
                </p>

                {/* '펼쳐보기' 토글 */}
                {isOverflowing && (
                    <button
                        className="self-start text-xs text-purple-500 hover:underline"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? "접기" : "펼쳐보기"}
                    </button>
                )}

                {/* 작성일자 */}
                <p className="text-font-300 mt-1 text-xs">
                    작성일: {new Date(review.createdAt).toLocaleDateString()}
                </p>
            </div>
        </li>
    );
}
