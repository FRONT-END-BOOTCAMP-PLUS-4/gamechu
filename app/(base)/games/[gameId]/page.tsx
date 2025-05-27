"use client";

import React, { useEffect, useState } from "react";
import GameTitleCard from "./components/GameTitleCard";
import GameInfoCard from "./components/GameInfoCard";
import ReviewSelector from "./components/ReviewSelector";
import Comment from "./components/Comment";
import CommentCard from "./components/CommentCard";
import Pager from "@/app/components/Pager";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/AuthStore";
import { getSession } from "next-auth/react";

interface Review {
    id: number;
    profileImage: string;
    nickname: string;
    date: string;
    tier: string;
    rating: number;
    comment: string;
    likes: number;
    isLiked: boolean;
    memberId: string;
}

interface GameDetail {
    id: number;
    title: string;
    developer: string;
    thumbnail: string;
    releaseDate: string;
    platforms: string[];
    genres: string[];
    themes: string[];
    wishCount: number;
    reviewCount: number;
    rating: number;
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

    const { user, setUser } = useAuthStore();
    const viewerId = user?.id;
    const [game, setGame] = useState<GameDetail | null>(null);

    useEffect(() => {
        getSession().then((session) => {
            if (session?.user) {
                setUser(session.user);
            }
        });
    }, [setUser]);

    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReviewType, setSelectedReviewType] = useState<
        "expert" | "user"
    >("expert");
    const [allComments, setAllComments] = useState<Review[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchComments = React.useCallback(async () => {
        if (!gameId) return;
        try {
            const url = viewerId
                ? `/api/games/${gameId}/reviews?viewerId=${viewerId}`
                : `/api/games/${gameId}/reviews`;
            const res = await fetch(url);
            const data = await res.json();

            const getTierIcon = (score: number): string => {
                if (score <= 1000) return "/icons/bronze.svg";
                if (score <= 2000) return "/icons/silver.svg";
                if (score <= 3000) return "/icons/gold.svg";
                if (score <= 4000) return "/icons/platinum.svg";
                return "/icons/diamond.svg";
            };

            const enriched = data.map(
                (r: any): Review => ({
                    id: r.id,
                    memberId: r.memberId,
                    profileImage: r.imageUrl ?? "/icons/profile.svg",
                    nickname: r.nickname ?? "유저",
                    date: new Date(r.createdAt).toLocaleDateString("ko-KR"),
                    tier: getTierIcon(r.score),
                    rating: r.rating / 2,
                    comment: r.content,
                    likes: r.likeCount ?? 0,
                    isLiked: r.isLiked ?? false,
                })
            );

            setAllComments(enriched);
        } catch (err) {
            console.error("🔥 댓글 조회 실패", err);
        }
    }, [gameId, viewerId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    useEffect(() => {
        if (!gameId) return;
        const fetchGame = async () => {
            try {
                const res = await fetch(`/api/games/${gameId}`);
                const data = await res.json();
                setGame(data);
            } catch (err) {
                console.error("🔥 게임 정보 조회 실패", err);
            }
        };
        fetchGame();
    }, [gameId]);

    const handleDelete = async (reviewId: number) => {
        const confirm = window.confirm("정말 삭제하시겠습니까?");
        if (!confirm) return;

        try {
            const res = await fetch(
                `/api/member/games/${gameId}/reviews/${reviewId}`,
                {
                    method: "DELETE",
                }
            );
            if (!res.ok) throw new Error("댓글 삭제 실패");
            await fetchComments();
        } catch (err) {
            console.error("🔥 댓글 삭제 실패", err);
            alert("댓글 삭제 실패");
        }
    };

    const myComment = allComments.find((c) => c.memberId === viewerId);
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

    return (
        <div className="min-h-screen bg-background-400 text-font-100 space-y-20 pb-10">
            <div className="flex w-[1400px] mx-auto justify-between gap-6 px-10 pt-20">
                {game && (
                    <>
                        <GameTitleCard
                            image={game.thumbnail}
                            title={game.title}
                            developer={game.developer}
                            rating={
                                expertComments.length > 0
                                    ? expertComments.reduce(
                                          (a, b) => a + b.rating,
                                          0
                                      ) / expertComments.length
                                    : 0
                            }
                            releaseDate={game.releaseDate}
                            gameId={game.id}
                        />
                        <GameInfoCard
                            platforms={game.platforms}
                            genres={game.genres}
                            themes={game.themes}
                            wishCount={game.wishCount}
                            reviewCount={game.reviewCount}
                        />
                    </>
                )}
            </div>
            <div className="w-full bg-black-300">
                <div className="flex w-full max-w-[1400px] mx-auto gap-6 px-10 items-start">
                    <ReviewSelector
                        selected={selectedReviewType}
                        onSelect={(type) => {
                            setSelectedReviewType(type);
                            fetchComments();
                        }}
                        expertReviewCount={expertComments.length}
                        expertAvgRating={
                            expertComments.length > 0
                                ? expertComments.reduce(
                                      (a, b) => a + b.rating,
                                      0
                                  ) / expertComments.length
                                : 0
                        }
                        userReviewCount={userComments.length}
                        userAvgRating={
                            userComments.length > 0
                                ? userComments.reduce(
                                      (a, b) => a + b.rating,
                                      0
                                  ) / userComments.length
                                : 0
                        }
                    />
                    <div className="flex-1 space-y-10">
                        {typeof gameId === "string" &&
                            gameId.length > 0 &&
                            (editingId !== null ? (
                                <Comment
                                    gameId={gameId}
                                    editingReviewId={editingId}
                                    defaultValue={myComment?.comment ?? ""}
                                    onSuccess={() => {
                                        fetchComments();
                                        setEditingId(null);
                                    }}
                                />
                            ) : myComment ? (
                                <div className="bg-background-300 rounded-[8px] ">
                                    <h3 className="text-h3 font-semibold">
                                        내가 작성한 댓글
                                    </h3>
                                    <CommentCard
                                        id={myComment.id}
                                        profileImage={myComment.profileImage}
                                        nickname={myComment.nickname}
                                        date={myComment.date}
                                        tier={myComment.tier}
                                        rating={myComment.rating}
                                        comment={myComment.comment}
                                        likes={myComment.likes}
                                        isLiked={myComment.isLiked}
                                        viewerId={viewerId ?? ""}
                                        memberId={myComment.memberId}
                                        onEdit={(id) => setEditingId(id)}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            ) : (
                                <Comment
                                    gameId={gameId}
                                    onSuccess={fetchComments}
                                />
                            ))}

                        <div className="space-y-6">
                            {commentsForPage.map((c) => (
                                <CommentCard
                                    key={c.id}
                                    id={c.id}
                                    profileImage={c.profileImage}
                                    nickname={c.nickname}
                                    date={c.date}
                                    tier={c.tier}
                                    rating={c.rating}
                                    comment={c.comment}
                                    likes={c.likes}
                                    isLiked={c.isLiked}
                                    viewerId={viewerId ?? ""}
                                    memberId={c.memberId}
                                    onDelete={handleDelete}
                                    onEdit={(id) => setEditingId(id)}
                                />
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
