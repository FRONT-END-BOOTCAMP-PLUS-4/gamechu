"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Button from "@/app/components/Button";
import Lottie from "lottie-react";
import Like from "@/public/like.json";
import TierBadge from "@/app/components/TierBadge";
import Toast from "@/app/components/Toast";
import { useRouter } from "next/navigation";

interface CommentCardProps {
    id: number;
    profileImage: string;
    nickname: string;
    date: string;
    rating: number;
    score: number;
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
    rating,
    comment,
    score,
    likes,
    isLiked: initiallyLiked,
    viewerId,
    memberId,
    onEdit,
    onDelete,
}: CommentCardProps) {
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(initiallyLiked);
    const [likeCount, setLikeCount] = useState(likes);
    const [showMenu, setShowMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const [animationDone, setAnimationDone] = useState(true);
    const menuRef = useRef<HTMLDivElement>(null);
    const [toast, setToast] = useState({
        show: false,
        message: "",
        status: "info" as "success" | "error" | "info",
    });

    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const commentRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const el = commentRef.current;
        if (el) {
            const lineHeight = parseFloat(
                getComputedStyle(el).lineHeight || "0"
            );
            const maxHeight = lineHeight * 2;
            if (el.scrollHeight > maxHeight) {
                setIsOverflowing(true);
            }
        }
    }, [comment]);

    const toggleMenu = () => setShowMenu((prev) => !prev);

    const handleLike = async () => {
        if (!viewerId) {
            setToast({
                show: true,
                message: "로그인이 필요합니다",
                status: "error",
            });
            setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
                router.push(
                    `/log-in?callbackUrl=${encodeURIComponent(
                        window.location.pathname
                    )}`
                );
            }, 1000);
            return;
        }

        if (viewerId === memberId) {
            setToast({
                show: true,
                message: "내가 작성한 댓글입니다",
                status: "error",
            });
            setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 1000);
            return;
        }

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
        <div className="relative w-[1060px] min-h-[100px] bg-background-200 rounded-[8px] p-4 pb-12 space-y-4 border border-line-100 border-opacity-50">
            {/* 유저 정보 */}
            <div className="flex justify-between items-start">
                <div className="flex gap-2 items-start">
                    <div className="w-[44px] h-[44px] rounded-full border border-line-100 overflow-hidden flex-shrink-0">
                        <Image
                            src={profileImage || "/placeholder.svg"}
                            alt="profile"
                            width={44}
                            height={44}
                            className="object-cover w-full h-full"
                            unoptimized
                        />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <span className="text-h3 text-font-100 font-medium">
                                {nickname}
                            </span>
                            <TierBadge score={score} size="sm" />
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
                                    onClick={() => onEdit?.(id)}
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
            {/* 댓글 내용 + 더보기 */}
            <div
                ref={commentRef}
                className={`text-body text-font-100 whitespace-pre-wrap transition-all duration-200 ${
                    expanded ? "" : "line-clamp-2"
                }`}
            >
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

            {isOverflowing && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="border border-line-100 border-opacity-50 flex items-center gap-1 px-3 py-1 text-primary-purple-200 font-bold font-h2 font hover:bg-background-300 rounded-md transition"
                    >
                        {expanded ? "접기 ▲" : "펼치기 ▼"}
                    </button>
                </div>
            )}
            {/* 토스트 알림 */}
            <Toast
                show={toast.show}
                status={toast.status}
                message={toast.message}
            />
        </div>
    );
}
