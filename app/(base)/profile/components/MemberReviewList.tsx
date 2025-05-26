// components/MemberReviewList.tsx
"use client";

import Image from "next/image";

interface MemberReviewItem {
    id: number;
    gameId: number;
    content: string;
    rating: number;
    createdAt: string;
    updatedAt: string | null;
    gameTitle: string;
    imageUrl: string | null;
}

export default function MemberReviewList({
    reviews,
}: {
    reviews: MemberReviewItem[];
}) {
    return (
        <div className="bg-background-300 p-6 rounded-xl shadow flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-body mb-2">
                작성한 리뷰
            </h2>
            {reviews.length === 0 ? (
                <p className="text-font-200 text-sm">
                    아직 작성한 리뷰가 없습니다.
                </p>
            ) : (
                <ul className="space-y-4">
                    {reviews.map((review) => (
                        <li
                            key={review.id}
                            className="flex items-start gap-4 border-b border-line-200 pb-4"
                        >
                            <div className="w-[80px] h-[80px] flex-shrink-0 rounded overflow-hidden">
                                <Image
                                    src={
                                        review.imageUrl?.startsWith("//")
                                            ? `https:${review.imageUrl}`
                                            : review.imageUrl ||
                                              "/images/default-game.png"
                                    }
                                    alt={review.gameTitle}
                                    width={80}
                                    height={80}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-body mb-1">
                                    {review.gameTitle}
                                </h3>
                                <p className="text-sm text-font-200 mb-1">
                                    {review.content}
                                </p>
                                <div className="flex gap-1">
                                    {Array.from({ length: review.rating }).map(
                                        (_, i) => (
                                            <Image
                                                key={i}
                                                src="/icons/purple-star.svg"
                                                alt="별점"
                                                width={16}
                                                height={16}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
