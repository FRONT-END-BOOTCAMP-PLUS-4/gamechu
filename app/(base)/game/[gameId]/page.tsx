"use client";

import React, { useEffect, useState } from "react";
import GameTitleCard from "./components/GameTitleCard";
import GameInfoCard from "./components/GameInfoCard";
import ReviewSelector from "./components/ReviewSelector";
import Comment from "./components/Comment";
import CommentCard from "./components/CommentCard";
import Pager from "@/app/components/Pager";
import { useParams } from "next/navigation";

interface Review {
    id: number;
    profileImage: string;
    nickname: string;
    date: string;
    tier: string;
    rating: number;
    comment: string;
    likes: number;
}

const isExpertTier = (tier: string) => {
    const expertTiers = ["/icons/platinum.svg", "/icons/diamond.svg"];
    return expertTiers.includes(tier);
};

export default function GameDetailPage() {
    const params = useParams();
    const gameId = Array.isArray(params.gameId)
        ? params.gameId[0]
        : params.gameId;
    useEffect(() => {}, [gameId]);

    console.log("gameId", gameId);
    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReviewType, setSelectedReviewType] = useState<
        "expert" | "user"
    >("expert");
    const [allComments, setAllComments] = useState<Review[]>([]);

    const fetchComments = React.useCallback(async () => {
        if (!gameId) return;

        try {
            const res = await fetch(`/api/reviews/game/${gameId}`);
            const data = await res.json();
            console.log("🔥 data from API:", data);

            const enriched = data.map(
                (r: any): Review => ({
                    id: r.id,
                    profileImage: r.imageUrl ?? "/icons/profile.svg",
                    nickname: r.nickname ?? "유저",
                    date: new Date(r.createdAt).toLocaleDateString("ko-KR"),
                    tier: "/icons/bronze.svg",
                    rating: r.rating,
                    comment: r.content,
                    likes: 0,
                })
            );

            setAllComments(enriched);
            console.log("🔥 enriched data:", enriched);
        } catch (err) {
            console.error("댓글 조회 실패", err);
        }
    }, [gameId]);

    useEffect(() => {
        fetchComments();
    }, [gameId, fetchComments]);

    const expertComments = allComments.filter((c) => isExpertTier(c.tier));
    const userComments = allComments.filter((c) => !isExpertTier(c.tier));
    const currentComments =
        selectedReviewType === "expert" ? expertComments : userComments;

    const totalItems = currentComments.length;
    const endPage = Math.ceil(totalItems / itemsPerPage);
    const pages = Array.from({ length: endPage }, (_, i) => i + 1);
    const commentsForPage = currentComments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    console.log(gameId);

    return (
        <div className="min-h-screen bg-background-400 text-font-100 space-y-20 pb-10">
            <div className="flex w-[1400px] mx-auto justify-between gap-6 px-10 pt-20 ">
                <GameTitleCard
                    image="https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg"
                    title="Zelda: Tears of the Kingdom"
                    developer="Nintendo"
                    rating={4.8}
                    releaseDate="2024.12.12"
                />
                <GameInfoCard
                    platform="PC, PS5, Switch"
                    genre="RPG, 애잔, 어드버처"
                    theme="공포, 판타지"
                    wishCount={12456}
                    reviewCount={1532}
                />
            </div>

            <div className="w-full bg-black-300 ">
                <div className="flex w-full max-w-[1400px] mx-auto gap-6 px-10 items-start">
                    <ReviewSelector
                        selected={selectedReviewType}
                        onSelect={setSelectedReviewType}
                    />
                    <div className="flex-1 space-y-10">
                        {typeof gameId === "string" && gameId.length > 0 && (
                            <Comment
                                gameId={gameId}
                                onSuccess={fetchComments}
                            />
                        )}
                        <div className="space-y-6">
                            {commentsForPage.map((c) => (
                                <CommentCard key={c.id} {...c} />
                            ))}
                        </div>
                        <Pager
                            currentPage={currentPage}
                            pages={pages}
                            endPage={endPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
