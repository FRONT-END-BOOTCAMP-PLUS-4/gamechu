// app/(base)/games/[gameId]/components/ClientContentWrapper.tsx
"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ReviewSelector from "./ReviewSelector";
import Comment from "./Comment";
import CommentCard from "./CommentCard";
import Pager from "@/app/components/Pager";
import { useGameReviews } from "@/hooks/useGameReviews";
import { queryKeys } from "@/lib/queryKeys";

type Props = {
    gameId: number;
    viewerId: string | null;
}

export default function ClientContentWrapper({ gameId, viewerId }: Props) {
    const commentRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReviewType, setSelectedReviewType] = useState<
        "expert" | "user"
    >("expert");
    const [editingId, setEditingId] = useState<number | null>(null);

    const { reviews: allComments, deleteReview } = useGameReviews(gameId);

    const isExpertTier = (score: number) => score >= 3000;

    const handleDelete = async (reviewId: number) => {
        const confirm = window.confirm("정말 삭제하시겠습니까?");
        if (!confirm) return;
        try {
            await deleteReview(reviewId);
        } catch {
            alert("댓글 삭제 실패");
        }
    };

    const handleReviewSuccess = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews(gameId) });
    };

    const myComment = allComments.find(
        (c) => String(c.memberId) === String(viewerId)
    );
    const expertComments = allComments.filter((c) => isExpertTier(c.score));
    const userComments = allComments.filter((c) => !isExpertTier(c.score));

    const currentComments =
        selectedReviewType === "expert" ? expertComments : userComments;

    // fix: myComment 상단/목록 중복 노출 방지 (#214)
    const listComments = myComment
        ? currentComments.filter((c) => c.id !== myComment.id)
        : currentComments;

    const totalItems = listComments.length;
    const endPage = Math.ceil(totalItems / itemsPerPage);
    const pages = Array.from({ length: endPage }, (_, i) => i + 1);
    const commentsForPage = listComments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex w-full flex-col items-start gap-10 lg:flex-row">
            <div className="flex w-full flex-shrink-0 flex-col lg:w-[300px]">
                <ReviewSelector
                    selected={selectedReviewType}
                    onSelect={(type) => {
                        setSelectedReviewType(type);
                        setCurrentPage(1);
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

            <div className="w-full max-w-full flex-1 space-y-10 px-4 lg:px-0">
                {typeof gameId === "number" &&
                    (editingId !== null ? (
                        <div ref={commentRef}>
                            <Comment
                                gameId={String(gameId)}
                                editingReviewId={editingId}
                                defaultValue={myComment?.comment ?? ""}
                                defaultRating={myComment?.rating ?? 0}
                                onSuccess={() => {
                                    handleReviewSuccess();
                                    setEditingId(null);
                                }}
                                viewerId={viewerId}
                            />
                        </div>
                    ) : myComment ? (
                        <div className="glow-border w-full">
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
                            onSuccess={handleReviewSuccess}
                            viewerId={viewerId}
                        />
                    ))}

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
