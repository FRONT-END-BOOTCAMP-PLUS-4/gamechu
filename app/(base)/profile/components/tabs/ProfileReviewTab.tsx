"use client";

import { useState, useMemo } from "react";
import MemberReviewItem, { MemberReviewItemProps } from "../MemberReviewItem";
import Pager from "@/app/components/Pager";

export default function ProfileReviewTab({
    reviews,
}: {
    reviews: MemberReviewItemProps[];
}) {
    const REVIEWS_PER_PAGE = 6;
    const [currentPage, setCurrentPage] = useState(1);

    // 전체 페이지 수 계산
    const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

    // 현재 페이지에서 보여줄 리뷰 리스트
    const currentReviews = useMemo(() => {
        const start = (currentPage - 1) * REVIEWS_PER_PAGE;
        const end = start + REVIEWS_PER_PAGE;
        return reviews.slice(start, end);
    }, [currentPage, reviews]);

    // 페이지 리스트 계산 (ex. [1, 2, 3])
    const pages = useMemo(() => {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }, [totalPages]);

    return (
        <div className="w-full bg-background-300 p-6 rounded-xl shadow flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-body mb-2">작성한 리뷰</h2>

            {reviews.length === 0 ? (
                <p className="text-font-200 text-sm">아직 작성한 리뷰가 없습니다.</p>
            ) : (
                <>
                    <ul className="space-y-4">
                        {currentReviews.map((review) => (
                            <MemberReviewItem key={review.id} {...review} />
                        ))}
                    </ul>
                    <Pager
                        currentPage={currentPage}
                        pages={pages}
                        endPage={totalPages}
                        onPageChange={(newPage) => setCurrentPage(newPage)}
                    />
                </>
            )}
        </div>
    );
}
