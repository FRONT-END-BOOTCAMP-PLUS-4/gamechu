"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReviewSelector from "./ReviewSelector";
import Comment from "./Comment";
import CommentCard from "./CommentCard";
import Pager from "@/app/components/Pager";

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
    score: number;
}

interface Props {
    gameId: number;
    viewerId: string | null;
}

export default function ClientContentWrapper({ gameId, viewerId }: Props) {
    const commentRef = useRef<HTMLDivElement>(null);

    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReviewType, setSelectedReviewType] = useState<
        "expert" | "user"
    >("expert");
    const [allComments, setAllComments] = useState<Review[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);

    const isExpertTier = (score: number) => score >= 3000;

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`/api/games/${gameId}/reviews`);
            const data = await res.json();

            const enriched = data.map(
                (r: {
                    id: number;
                    memberId: string;
                    imageUrl?: string;
                    nickname?: string;
                    createdAt: string;
                    score: number;
                    rating: number;
                    content: string;
                    likeCount?: number;
                    isLiked?: boolean;
                }): Review => ({
                    id: r.id,
                    memberId: r.memberId,
                    profileImage: r.imageUrl ?? "/icons/profile.svg",
                    nickname: r.nickname ?? "유저",
                    date: new Date(r.createdAt).toLocaleDateString("ko-KR"),
                    tier: String(r.score),
                    rating: r.rating / 2,
                    comment: r.content,
                    likes: r.likeCount ?? 0,
                    isLiked: r.isLiked ?? false,
                    score: r.score ?? 0,
                })
            );

            setAllComments(enriched);
        } catch (err) {
            console.error("댓글 조회 실패", err);
        }
    }, [gameId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleDelete = async (reviewId: number) => {
        const confirm = window.confirm("정말 삭제하시겠습니까?");
        if (!confirm) return;

        try {
            const res = await fetch(
                `/api/member/games/${gameId}/reviews/${reviewId}`,
                { method: "DELETE" }
            );
            if (!res.ok) throw new Error("댓글 삭제 실패");
            await fetchComments();
        } catch (err) {
            console.error(" 댓글 삭제 실패", err);
            alert("댓글 삭제 실패");
        }
    };

    const myComment = allComments.find(
        (c) => String(c.memberId) === String(viewerId)
    );
    const expertComments = allComments.filter((c) => isExpertTier(c.score));
    const userComments = allComments.filter((c) => !isExpertTier(c.score));
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
        <div className="w-full flex gap-10 items-start">
            {/* 좌측: 셀렉터 */}
            <div className="w-[300px] flex-shrink-0">
                <ReviewSelector
                    selected={selectedReviewType}
                    onSelect={(type) => {
                        setSelectedReviewType(type);
                        fetchComments();
                    }}
                    expertReviewCount={expertComments.length}
                    expertAvgRating={
                        expertComments.length > 0
                            ? expertComments.reduce((a, b) => a + b.rating, 0) /
                              expertComments.length
                            : 0
                    }
                    userReviewCount={userComments.length}
                    userAvgRating={
                        userComments.length > 0
                            ? userComments.reduce((a, b) => a + b.rating, 0) /
                              userComments.length
                            : 0
                    }
                />
            </div>

            {/* 우측: 댓글 등록 + 리스트 */}
            <div className="flex-1 space-y-10">
                {/* 내가 쓴 댓글 or 댓글 작성 */}
                {typeof gameId === "number" &&
                    (editingId !== null ? (
                        <div ref={commentRef}>
                            <Comment
                                gameId={String(gameId)}
                                editingReviewId={editingId}
                                defaultValue={myComment?.comment ?? ""}
                                onSuccess={() => {
                                    fetchComments();
                                    setEditingId(null);
                                }}
                                viewerId={viewerId}
                            />
                        </div>
                    ) : myComment ? (
                        <div className="glow-border w-fit mx-auto">
                            <div className="glow-border-inner">
                                <CommentCard
                                    id={myComment.id}
                                    profileImage={myComment.profileImage}
                                    nickname={myComment.nickname}
                                    date={myComment.date}
                                    score={myComment.score}
                                    rating={myComment.rating}
                                    comment={myComment.comment}
                                    likes={myComment.likes}
                                    isLiked={myComment.isLiked}
                                    viewerId={viewerId ?? ""}
                                    memberId={myComment.memberId}
                                    onEdit={(id) => {
                                        setEditingId(id);
                                        setTimeout(() => {
                                            commentRef.current?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "center",
                                            });
                                        }, 100);
                                    }}
                                    onDelete={handleDelete}
                                />
                            </div>
                        </div>
                    ) : (
                        <Comment
                            gameId={String(gameId)}
                            onSuccess={fetchComments}
                        />
                    ))}

                {/* 댓글 리스트 */}

                {commentsForPage.map((c) => (
                    <CommentCard
                        key={c.id}
                        id={c.id}
                        profileImage={c.profileImage}
                        nickname={c.nickname}
                        date={c.date}
                        rating={c.rating}
                        score={c.score}
                        comment={c.comment}
                        likes={c.likes}
                        isLiked={c.isLiked}
                        viewerId={viewerId ?? ""}
                        memberId={c.memberId}
                        onDelete={handleDelete}
                        onEdit={(id) => setEditingId(id)}
                    />
                ))}

                {commentsForPage.length > 0 && (
                    <Pager
                        currentPage={currentPage}
                        pages={pages}
                        endPage={endPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
}
