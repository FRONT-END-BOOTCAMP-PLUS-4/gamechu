"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Button from "@/app/components/Button";
import Lottie from "lottie-react";
import Like from "@/public/like.json";
import TierBadge from "@/app/components/TierBadge";
import Toast from "@/app/components/Toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";

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
    const [contentHeight, setContentHeight] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);
    const [toast, setToast] = useState({
        show: false,
        message: "",
        status: "info" as "success" | "error" | "info",
    });

    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const commentRef = useRef<HTMLDivElement>(null);

    //실제 콘텐츠 높이 저장을 위한 useEffect
    useEffect(() => {
        const el = commentRef.current;
        if (!el) return;

        const scrollHeight = el.scrollHeight;
        setContentHeight(scrollHeight); // 실제 콘텐츠 높이 저장
        setIsOverflowing(scrollHeight > 150);
    }, [comment]);

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
        if (!el) return;

        // 실제 렌더된 영역(clientHeight)보다 스크롤 가능한 높이(scrollHeight)가
        // 더 크면 "내용이 넘친다"고 판단해서 접기/펼치기 버튼을 노출
        const hasOverflow = el.scrollHeight - el.clientHeight > 2;
        setIsOverflowing(hasOverflow);
    }, [comment]);

    const toggleMenu = () => setShowMenu((prev) => !prev);

    const handleLike = async () => {
        if (!viewerId) {
            setToast({
                show: true,
                message: "로그인이 필요합니다",
                status: "error",
            });
            router.push(
                `/log-in?callbackUrl=${encodeURIComponent(
                    window.location.pathname
                )}`
            );
            return;
        }

        if (viewerId === memberId) {
            setToast({
                show: true,
                message: "내가 작성한 댓글입니다",
                status: "error",
            });
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
        <div className="relative min-h-[100px] w-full space-y-4 rounded-[8px] border border-line-100 border-opacity-50 bg-background-200 p-4 pb-12">
            {/* 유저 정보 */}
            <div className="flex items-start justify-between">
                <div className="flex w-full items-start gap-2">
                    {/* 프로필 이미지 */}
                    <div className="h-[44px] w-[44px] flex-shrink-0 overflow-hidden rounded-full border border-line-100">
                        <Image
                            src={profileImage}
                            alt="profile"
                            width={44}
                            height={44}
                            className="h-full w-full object-cover"
                            unoptimized
                        />
                    </div>
                    {/* 닉네임, 티어, 날짜 */}
                    <div className="flex flex-1 flex-col">
                        <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-font-100 lg:text-base">
                                {nickname}
                            </span>
                            <TierBadge score={score} />
                        </div>
                        <span className="max-w-[100px] truncate text-caption text-font-200">
                            {date}
                        </span>
                    </div>
                    {/* 평점 */}
                    <div className="flex flex-shrink-0 items-center gap-2 rounded-full bg-background-300 px-4 py-2">
                        <Image
                            src="/icons/empty-purple-star.svg"
                            alt="star"
                            width={18}
                            height={18}
                        />
                        <span className="whitespace-nowrap text-sm font-bold text-font-100">
                            {rating.toFixed(1)}
                        </span>
                    </div>
                    {/* 메뉴 */}
                    {viewerId === memberId && (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={toggleMenu}
                                className="rounded-lg p-2 text-font-200 transition hover:bg-primary-purple-100 hover:text-font-100"
                            >
                                <MoreVertical size={20} />
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 top-full z-30 flex min-w-[80px] flex-col gap-2 rounded-lg border border-line-100 bg-background-100 p-3 shadow-xl">
                                    <Button
                                        type="black"
                                        size="small"
                                        label="수정"
                                        onClick={() => onEdit?.(id)}
                                    />
                                    <Button
                                        type="red"
                                        size="small"
                                        label="삭제"
                                        onClick={() => onDelete?.(id)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* 구분선 */}
            <hr className="w-full border-t opacity-75" />
            {/* 댓글 내용 + 더보기 */}
            <div className="relative">
                <motion.div
                    ref={commentRef}
                    initial={false}
                    animate={{
                        maxHeight: expanded ? `${contentHeight}px` : "150px",
                        opacity: expanded ? 1 : 0.9,
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="prose overflow-hidden text-sm text-font-100 lg:text-body"
                    dangerouslySetInnerHTML={{ __html: comment }}
                />
                {/* 흐림 효과 (그라데이션): 넘칠 때(isOverflowing)이면서 접혀있을 때만 표시 */}
                <AnimatePresence>
                    {isOverflowing && !expanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            // pb-12로 인해 버튼 영역이 확보되어 있으므로, 텍스트 하단에 딱 붙도록 위치 조정
                            className="pointer-events-none absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-background-200 via-background-200/80 to-transparent"
                        />
                    )}
                </AnimatePresence>
            </div>
            {/* 좋아요 버튼 */}
            <div className="absolute bottom-1 left-1 flex items-center">
                <button
                    onClick={handleLike}
                    disabled={isLoading}
                    className="group flex items-center"
                >
                    <div className="flex h-[40px] w-[40px] items-center justify-center">
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
                                    className="h-full w-full"
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

                    <span
                        className={`text-sm transition-colors lg:text-base ${
                            isLiked ? "text-red-500" : "text-font-200"
                        }`}
                    >
                        {likeCount}
                    </span>
                </button>
            </div>

            {isOverflowing && (
                <div className="absolute bottom-2 right-4 flex items-center">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1.5 rounded-lg bg-background-300/70 px-3 py-2 text-sm font-bold text-font-200 transition-all hover:bg-background-300 hover:text-font-100 active:scale-95"
                    >
                        <span>{expanded ? "접기" : "더보기"}</span>

                        {expanded ? (
                            <ChevronUp size={18} strokeWidth={2} />
                        ) : (
                            <ChevronDown size={18} strokeWidth={2} />
                        )}
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
