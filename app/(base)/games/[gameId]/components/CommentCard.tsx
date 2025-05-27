"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Button from "@/app/components/Button";
import Lottie from "lottie-react";
import Like from "@/public/like.json";

interface CommentCardProps {
    id: number;
    profileImage: string;
    nickname: string;
    date: string;
    tier: string;
    rating: number;
    comment: string;
    likes: number;
    isLiked: boolean;
    viewerId?: string;
    memberId: string;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
}

export default function CommentCard({
    id,
    profileImage,
    nickname,
    date,
    tier,
    rating,
    comment,
    likes,
    isLiked: initiallyLiked,
    viewerId,
    memberId,
    onDelete,
    onEdit,
}: CommentCardProps) {
    const [isLiked, setIsLiked] = useState(initiallyLiked);
    const [likeCount, setLikeCount] = useState(likes);
    const [showMenu, setShowMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const [animationDone, setAnimationDone] = useState(true);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsLiked(initiallyLiked);
        setLikeCount(likes);
    }, [initiallyLiked, likes]);

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
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleMenu = () => setShowMenu((prev) => !prev);

    const handleLike = async () => {
        if (!viewerId) return alert("로그인 후 좋아요를 누를 수 있습니다.");
        if (viewerId === memberId) return alert("내가 작성한 댓글입니다.");
        if (isLoading) return;

        setIsLoading(true);
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setLikeCount((prev) => prev + (newLikedState ? 1 : -1));

        if (newLikedState) {
            setAnimationKey((prev) => prev + 1);
            setAnimationDone(false);
        }

        try {
            const res = await fetch(`/api/member/review-likes/${id}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memberId: viewerId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setIsLiked(!newLikedState);
                setLikeCount((prev) => prev + (newLikedState ? -1 : 1));
                console.error("좋아요 실패", data);
            }
        } catch (err) {
            setIsLiked(!newLikedState);
            setLikeCount((prev) => prev + (newLikedState ? -1 : 1));
            console.error("좋아요 요청 에러", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative w-[1000px] min-h-[100px] bg-background-200 rounded-[8px] p-4 pb-12 space-y-4 border border-line-100 border-opacity-50">
            {/* 유저 정보 */}
            <div className="flex justify-between items-start">
                <div className="flex gap-2 items-start">
                    <Image
                        src={profileImage || "/placeholder.svg"}
                        alt="profile"
                        width={44}
                        height={44}
                        className="rounded-full border border-line-100 object-cover"
                        unoptimized
                    />
                    <div className="flex flex-col">
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
                        <span className="text-caption text-font-200">
                            {date}
                        </span>
                    </div>
                    <div className="w-px h-[40px] bg-line-100 mx-2 opacity-50" />
                    <div className="flex items-center h-[44px]">
                        <Image
                            src="/icons/empty-purple-star.svg"
                            alt="star"
                            width={20}
                            height={20}
                            className="mr-1"
                        />
                        <span className="text-font-100">
                            {rating.toFixed(1)} / 5.0
                        </span>
                    </div>
                </div>

                {viewerId === memberId && (
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
                            <div className="absolute top-0 right-0 px-4 py-4 space-y-1 z-30 ">
                                <Button
                                    type="black"
                                    size="small"
                                    label="수정"
                                    onClick={() => {
                                        onEdit?.(id);
                                        console.log("수정 클릭 확인", id);
                                    }}
                                />
                                <Button
                                    type="black"
                                    size="small"
                                    label="삭제"
                                    onClick={() => onDelete?.(id)}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <hr className="w-full bg-line-100 opacity-75" />

            {/* 댓글 내용 */}
            <div className="text-body text-font-100 whitespace-pre-wrap">
                {comment}
            </div>

            {/* 좋아요 버튼 */}
            <div className="absolute bottom-1 left-1 flex items-center">
                <button onClick={handleLike} disabled={isLoading}>
                    <div className="w-[50px] h-[50px] flex items-center justify-center">
                        {isLiked ? (
                            animationDone ? (
                                <Image
                                    src="/icons/red-wish.svg"
                                    alt="liked"
                                    width={20}
                                    height={20}
                                    className="object-contain"
                                />
                            ) : (
                                <Lottie
                                    key={`liked-${animationKey}`}
                                    animationData={Like}
                                    loop={false}
                                    className="w-full h-full"
                                />
                            )
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
                <span className="text-font-200">좋아요 ({likeCount})</span>
            </div>
        </div>
    );
}
