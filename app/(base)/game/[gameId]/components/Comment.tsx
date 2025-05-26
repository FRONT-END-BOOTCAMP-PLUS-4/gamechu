"use client";

import React, { useEffect, useState } from "react";
import StarRating from "@/app/(base)/game/[gameId]/components/StarRating";
import Button from "@/app/components/Button";
import { cn } from "@/utils/tailwindUtil";
import Typing from "@/public/typing.json";
import Lottie from "lottie-react";

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
}: CommentProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [text, setText] = useState(defaultValue || "");
    const [rating, setRating] = useState(0); // 수정 시 기존 rating도 넘겨받을 수 있게 개선 가능

    useEffect(() => {
        setText(defaultValue || "");
    }, [defaultValue]);

    const handleSubmit = async () => {
        if (!text.trim() || rating <= 0) return;

        const isEditing = !!editingReviewId;

        try {
            const res = await fetch(
                isEditing ? `/api/reviews/${editingReviewId}` : `/api/reviews`,
                {
                    method: isEditing ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        gameId: Number(gameId),
                        content: text,
                        rating,
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
            alert("리뷰 저장에 실패했습니다.");
        }
    };

    return (
        <div className="w-[1000px] h-[250px] bg-background-100 rounded-[4px] p-4 flex gap-4 relative">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="리뷰를 입력하세요..."
                className={cn(
                    "w-[800px] h-[218px] bg-background-200 rounded-[8px] p-4 resize-none text-body text-font-100 placeholder-font-200 outline-none border transition",
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
                    label={editingReviewId ? "수정" : "등록"}
                    onClick={handleSubmit}
                />
            </div>
        </div>
    );
}
