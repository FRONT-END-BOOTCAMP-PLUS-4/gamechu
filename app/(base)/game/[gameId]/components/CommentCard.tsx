"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Lottie from "lottie-react";
import Like from "@/public/like.json";

import Button from "@/app/components/Button";

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
    const [isLiked, setIsLiked] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLike = () => setIsLiked((prev) => !prev);
    const toggleMenu = () => setShowMenu((prev) => !prev);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-[1000px] min-h-[100px] bg-background-200 rounded-[8px] p-4 pb-12 space-y-4 border border-line-100 border-opacity-50">
            {/* 유저 정보 + 별점 + 메뉴 */}
            <div className="flex justify-between items-start">
                <div className="flex gap-2 items-start">
                    <Image
                        src={profileImage}
                        alt="profile"
                        width={44}
                        height={44}
                        className="rounded-full border border-line-100 object-cover"
                        style={{
                            width: "44px",
                            height: "44px",
                            objectFit: "cover",
                        }}
                        unoptimized
                    />
                    <div className="flex flex-col">
                        {/* 닉네임 + 티어 */}
                        <div className="flex items-center gap-1">
                            <span className="text-h3 text-font-100 font-medium">
                                {nickname}
                            </span>
                            <Image
                                src={tier}
                                alt="tier"
                                width={20}
                                height={20}
                            />
                        </div>

                        {/* 날짜 */}
                        <span className="text-caption text-font-200">
                            {date}
                        </span>
                    </div>

                    <div className="w-px h-[40px] bg-line-100 mx-2 opacity-50" />

                    {/* 별점 */}
                    <div className="flex items-center h-[44px] ">
                        <Image
                            src="/icons/empty-purple-star.svg"
                            alt="star"
                            width={20}
                            height={20}
                            className="mr-1"
                        />
                        <span className=" text-font-100">
                            {rating.toFixed(1)} / 5.0
                        </span>
                    </div>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={toggleMenu}
                        className="p-1 rounded hover:bg-primary-purple-100 transition"
                    >
                        <Image
                            src="/icons/hamburger.svg"
                            alt="menu"
                            width={24}
                            height={24}
                            className="cursor-pointer invert"
                        />
                    </button>

                    {showMenu && (
                        <div className="absolute top-0 right-0 px-4 py-4 space-y-1 z-30">
                            <Button type="black" size="small" label="수정" />
                            <Button type="black" size="small" label="삭제" />
                        </div>
                    )}
                </div>
            </div>

            <hr className="w-full  bg-line-100  opacity-75" />

            {/* 댓글 내용 */}
            <div className="text-body text-font-100 whitespace-pre-wrap">
                {comment}
            </div>

            {/* 좋아요 */}
            <div className="absolute bottom-1 left-1 flex items-center">
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
