"use client";

import { useEffect, useState } from "react";
import Button from "@/app/components/Button";

interface WishlistGame {
    id: number;
    title: string;
    developer: string;
    thumbnail: string;
    platform: string;
}

export default function WishlistButtonClient({
    gameId,
    viewerId,
}: {
    gameId: number;
    viewerId: string;
}) {
    const [isWished, setIsWished] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!viewerId) return;
        
        console.log("📡 WishlistButtonClient viewerId:", viewerId);
        console.log("📡 Fetching wishlists for gameId:", gameId);

        const fetchWishlistStatus = async () => {
            try {
                const res = await fetch("/api/member/wishlists");

                if (!res.ok) throw new Error("위시리스트 조회 실패");

                const list: WishlistGame[] = await res.json();
                console.log("✅ 현재 위시리스트:", list);

                const exists = list.some((game) => game.id === gameId);
                console.log("🧩 이 게임은 위시리스트에 있음?", exists);

                setIsWished(exists);
            } catch (err) {
                console.error("❌ 위시리스트 상태 확인 실패", err);
            }
        };

        fetchWishlistStatus();
    }, [viewerId, gameId]);

    const handleToggle = async () => {
        if (isWished === null) return;
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

    if (isWished === null) {
        console.log("⏳ 아직 위시리스트 상태 로딩 중...");
        return null;
    }

    return (
        <Button
            label={
                loading
                    ? "처리 중..."
                    : isWished
                    ? "위시리스트 삭제"
                    : "위시리스트 등록"
            }
            onClick={handleToggle}
            disabled={loading}
            type={isWished ? "black" : "purple"}
            size="medium"
        />
    );
}
