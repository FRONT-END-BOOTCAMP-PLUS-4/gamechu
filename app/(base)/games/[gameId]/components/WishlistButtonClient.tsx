"use client";

import { useEffect, useState } from "react";
import Button from "@/app/components/Button";

export default function WishlistButtonClient({
    gameId,
    viewerId,
}: {
    gameId: number;
    viewerId: string;
}) {
    const [isWished, setIsWished] = useState<boolean | null>(null);
    const [wishlistId, setWishlistId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!viewerId || !gameId) return;

        console.log("📡 WishlistButtonClient viewerId:", viewerId);
        console.log("📡 Fetching wishlists for gameId:", gameId);

        const fetchWishlistStatus = async () => {
            try {
                const res = await fetch(
                    `/api/member/wishlists?gameId=${gameId}`
                );

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.message || "위시리스트 조회 실패");
                }

                const data = await res.json();
                console.log("✅ 위시리스트 조회 결과:", data);

                if (typeof data.exists === "boolean") {
                    setIsWished(data.exists);
                } else {
                    console.warn("⚠️ 'exists' 값이 잘못됨:", data.exists);
                    setIsWished(false);
                }

                if (data.wishlistId) {
                    setWishlistId(data.wishlistId);
                } else {
                    console.warn("⚠️ wishlistId 없음:", data.wishlistId);
                    setWishlistId(null);
                }
            } catch (err) {
                console.error("❌ 위시리스트 상태 확인 실패", err);
                setIsWished(false);
                setWishlistId(null); // 안전하게 초기화
            }
        };

        fetchWishlistStatus();
    }, [viewerId, gameId]);

    const handleToggle = async () => {
        if (isWished === null) return;
        setLoading(true);

        try {
            if (isWished && wishlistId !== null) {
                // 삭제
                console.log(`🗑 DELETE /api/member/wishlists/${wishlistId}`);
                const res = await fetch(`/api/member/wishlists/${wishlistId}`, {
                    method: "DELETE",
                });
                if (!res.ok) throw new Error("위시리스트 삭제 실패");

                setIsWished(false);
                setWishlistId(null);
            } else {
                // 등록
                console.log("➕ POST /api/member/wishlists");
                const res = await fetch("/api/member/wishlists", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ gameId }),
                });
                if (!res.ok) throw new Error("위시리스트 등록 실패");

                const { wishlistId: newId } = await res.json(); // ✅ 서버에서 ID 반환 필요
                setIsWished(true);
                setWishlistId(newId);
            }
        } catch (err) {
            console.error("🔥 위시리스트 토글 실패", err);
            alert("처리에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ 로그인 안 했을 경우 버튼 출력 X
    if (!viewerId) return null;

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
