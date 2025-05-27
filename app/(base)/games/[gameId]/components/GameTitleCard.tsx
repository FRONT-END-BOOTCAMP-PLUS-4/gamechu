"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/app/components/Button";
import { useAuthStore } from "@/stores/AuthStore";

interface GameTitleCardProps {
    image: string;
    title: string;
    developer: string;
    rating?: number;
    releaseDate: string;
    gameId: number;
}

interface WishlistGame {
    id: number;
    title: string;
    developer: string;
    thumbnail: string;
    platform: string;
}

export default function GameTitleCard({
    image,
    title,
    developer,
    rating,
    releaseDate,
    gameId,
}: GameTitleCardProps) {
    const { user } = useAuthStore();
    const [isWished, setIsWished] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);

    // 위시리스트 상태 확인
    useEffect(() => {
        if (!user?.id || !gameId) return;

        const fetchWishlistStatus = async () => {
            try {
                const res = await fetch("/api/member/wishlists");
                if (!res.ok) throw new Error("위시리스트 조회 실패");

                const list: WishlistGame[] = await res.json(); // ✅ 명확한 타입 지정
                const exists = list.some((game) => game.id === gameId);
                setIsWished(exists);
            } catch (err) {
                console.error("🔥 위시리스트 상태 확인 실패", err);
            }
        };

        fetchWishlistStatus();
    }, [user?.id, gameId]);

    const handleWishlistToggle = async () => {
        if (!user?.id || isWished === null) return;

        setLoading(true);
        try {
            const res = await fetch("/api/member/wishlists", {
                method: isWished ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gameId }),
            });

            if (!res.ok) throw new Error("위시리스트 변경 실패");

            setIsWished((prev) => !prev);
        } catch (err) {
            console.error("🔥 위시리스트 토글 실패", err);
            alert("처리에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full max-w-[960px] h-[330px] overflow-hidden">
            {/* 왼쪽 게임 이미지 */}
            <div className="flex-none relative w-[480px] h-[330px]">
                <Image
                    src={image.startsWith("//") ? `https:${image}` : image}
                    alt={title}
                    fill
                    className="object-fill"
                />
            </div>

            {/* 오른쪽 정보 영역 */}
            <div className="flex-1 flex-col p-10">
                <div className="mb-6 mt-4">
                    <h2 className="text-h2 font-semibold text-font-100 line-clamp-1">
                        {title}
                    </h2>
                    <p className="text-caption text-font-200">{developer}</p>
                </div>

                {/* 평점 및 출시일 */}
                <div className="flex justify-left gap-6 mb-6">
                    <div className="flex gap-3 items-start">
                        <Image
                            src="/icons/yellow-star.svg"
                            alt="rating"
                            width={36}
                            height={36}
                        />
                        <div className="flex flex-col">
                            {typeof rating === "number" ? (
                                <span className="text-regular font-semibold text-font-100">
                                    {rating.toFixed(1)} / 5.0
                                </span>
                            ) : (
                                <span className="text-regular text-font-200">
                                    평점 없음
                                </span>
                            )}
                            <span className="text-caption text-font-200">
                                겜잘알 평점
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 items-start">
                        <Image
                            src="/icons/release-date.svg"
                            alt="release date"
                            width={36}
                            height={36}
                        />
                        <div className="flex flex-col">
                            <span className="text-regular font-semibold text-font-100">
                                {releaseDate}
                            </span>
                            <span className="text-caption text-font-200">
                                출시일
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    {isWished !== null && (
                        <Button
                            label={
                                loading
                                    ? "처리 중..."
                                    : isWished
                                    ? "위시리스트 삭제"
                                    : "위시리스트 등록"
                            }
                            onClick={handleWishlistToggle}
                            disabled={loading}
                            type={isWished ? "black" : "purple"}
                            size="medium"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
