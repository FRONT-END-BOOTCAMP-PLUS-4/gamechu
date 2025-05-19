"use client";

import React, { useState } from "react";
import Image from "next/image";
import StarRating from "@/app/(base)/game/[id]/components/StarRating";
import Lottie from "lottie-react";
import Like from "@/public/like.json";

interface CommentCardProps {
    profileImage: string;
    nickname: string;
    date: string;
    tier: string;
    rating: number;
    comment: string;
    likes: number;
}

export default function CommentCard({
    profileImage,
    nickname,
    date,
    tier,
    rating,
    comment,
    likes,
}: CommentCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    const handleToggleExpand = () => setIsExpanded((prev) => !prev);
    const handleLike = () => setIsLiked((prev) => !prev);

    return (
        <div className="w-[1000px] min-h-[250px] bg-background-200 rounded-[4px] p-4 space-y-4 relative border border-line-100 border-opacity-50">
            {/* 유저 정보 + 별점 */}
            <div className="flex justify-between items-start">
                <div className="flex gap-3 items-start">
                    {/* 프로필 */}
                    <Image
                        src={profileImage}
                        alt="profile"
                        width={50}
                        height={50}
                        className="rounded-full border border-line-100 o"
                    />

                    {/* 닉네임 + 날짜 + 티어 */}
                    <div className="flex flex-col gap-1">
                        <span className="text-h2 text-font-100 font-medium">
                            {nickname}
                        </span>
                        <span className="text-caption text-font-200">
                            {date}
                        </span>
                    </div>

                    {/* 티어 */}
                    <Image src={tier} alt="tier" width={50} height={50} />
                </div>

                {/* 별점 */}
                <StarRating value={rating} variant="noText" readOnly />
            </div>

            {/* 댓글 */}
            <div className="text-body text-font-100 whitespace-pre-wrap">
                {isExpanded || comment.length <= 180
                    ? comment
                    : `${comment.slice(0, 180)}...`}
                {comment.length > 180 && (
                    <button
                        onClick={handleToggleExpand}
                        className="text-caption text-primary-purple-200 underline ml-2"
                    >
                        {isExpanded ? "접기" : "펼치기"}
                    </button>
                )}
            </div>

            {/* 좋아요 */}
            <div className="absolute bottom-4 left-4 flex items-center ">
                <button onClick={handleLike}>
                    <div className="w-[50px] h-[50px] flex items-center justify-center">
                        {isLiked ? (
                            <Lottie
                                key="liked"
                                animationData={Like}
                                loop={false}
                                className="w-full h-full"
                            />
                        ) : (
                            <Image
                                src="/icons/wish.svg"
                                alt="like"
                                width={20}
                                height={20}
                                className="object-contain"
                            />
                        )}
                    </div>
                </button>
                <span className="text-font-200">
                    좋아요 ({likes + (isLiked ? 1 : 0)})
                </span>
            </div>
        </div>
    );
}
