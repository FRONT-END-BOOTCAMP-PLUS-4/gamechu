"use client";

import React, { useEffect, useState } from "react";
import StarRating from "@/app/(base)/games/[gameId]/components/StarRating";
import Button from "@/app/components/Button";
import { cn } from "@/utils/tailwindUtil";
import Typing from "@/public/typing.json";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import Toast from "@/app/components/Toast";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";

interface CommentProps {
    gameId: string;
    editingReviewId?: number;
    defaultValue?: string;
    onSuccess: () => void;
}

export default function Comment({
    gameId,
    editingReviewId,
    defaultValue = "",
    onSuccess,
}: CommentProps & { viewerId?: string | null }) {
    const viewerId = getAuthUserId();
    const router = useRouter();
    const [isFocused, setIsFocused] = useState(false);
    const [text, setText] = useState(defaultValue || "");
    const [rating, setRating] = useState(0);
    const [toast, setToast] = useState({
        show: false,
        message: "",
        status: "info" as "success" | "error" | "info",
    });
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        setText(defaultValue || "");
    }, [defaultValue]);

    const handleSubmit = async () => {
        if (isLoading) return;
        if (!viewerId || typeof viewerId !== "string") {
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
        if (!text.trim() || rating <= 0) return;

        const isEditing = !!editingReviewId;
        setIsLoading(true);

        try {
            const res = await fetch(
                isEditing
                    ? `/api/member/games/${gameId}/reviews/${editingReviewId}`
                    : `/api/member/games/${gameId}/reviews/`,
                {
                    method: isEditing ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        gameId: Number(gameId),
                        content: text,
                        rating: Math.round(rating * 2),
                    }),
                }
            );

            if (!res.ok)
                throw new Error(
                    isEditing ? "리뷰 수정 실패" : "리뷰 등록 실패"
                );

            setText("");
            setRating(0);
            onSuccess();
        } catch (err) {
            console.error("🔥 리뷰 저장 실패:", err);
            setToast({
                show: true,
                message: "리뷰 저장에 실패했습니다.",
                status: "error",
            });
            setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 3000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-[1060px] h-[250px] bg-background-100 rounded-[4px] p-4 flex gap-4 relative">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="리뷰를 입력하세요..."
                className={cn(
                    "w-[860px] h-[218px] bg-background-200 rounded-[8px] p-4 resize-none text-body text-font-100 placeholder-font-200 outline-none border transition",
                    isFocused
                        ? "border-2 border-primary-purple-200"
                        : "border border-line-200"
                )}
            />
            <div className="absolute top-4 right-4">
                <StarRating value={rating} onChange={setRating} />
                <div className="w-[110px] h-[110px] relative -translate-y-2 ml-4">
                    <Lottie animationData={Typing} loop autoplay />
                </div>
            </div>
            <div className="absolute bottom-4 right-4">
                <Button
                    label={
                        isLoading
                            ? "등록 중.."
                            : editingReviewId
                            ? "수정"
                            : "등록"
                    }
                    onClick={handleSubmit}
                />
            </div>
            <Toast
                show={toast.show}
                status={toast.status}
                message={toast.message}
            />
        </div>
    );
}
