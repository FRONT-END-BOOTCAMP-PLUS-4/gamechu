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
        <li className="bg-background-200 p-4 rounded-lg shadow relative flex gap-4">
            {/* 게임 이미지 → 상세 페이지 링크 */}
            <Link href={`/game/${review.gameId}`}>
                <div className="w-[80px] h-[80px] flex-shrink-0 rounded overflow-hidden cursor-pointer">
                    <Image
                        src={
                            review.imageUrl?.startsWith("//")
                                ? `https:${review.imageUrl}`
                                : review.imageUrl || "/images/default-game.png"
                        }
                        alt={review.gameTitle}
                        width={80}
                        height={80}
                        className="object-cover rounded"
                    />
                </div>
            </Link>

            {/* 텍스트 콘텐츠 */}
            <div className="flex-1 flex flex-col gap-2 relative">
                {/* 별점 (우측 상단) */}
                <div className="absolute top-0 right-0 flex items-center gap-1">
                    <Image
                        src="/icons/purple-star.svg"
                        alt="별점 아이콘"
                        width={16}
                        height={16}
                    />
                    <span className="text-sm text-purple-500 font-semibold">
                        {review.rating}.0
                    </span>
                </div>

                {/* 게임 제목 */}
                <Link href={`/game/${review.gameId}`}>
                    <h3 className="font-semibold text-body hover:underline cursor-pointer">
                        {review.gameTitle}
                    </h3>
                </Link>

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
                <p className="text-xs text-font-300 mt-1">
                    작성일: {new Date(review.createdAt).toLocaleDateString()}
                </p>
            </div>
        </li>
    );
}