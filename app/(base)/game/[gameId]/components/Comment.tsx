"use client";

import React, { useState } from "react";
import StarRating from "@/app/(base)/game/[gameId]/components/StarRating";
import Button from "@/app/components/Button";
import { cn } from "@/utils/tailwindUtil";
import Typing from "@/public/typing.json";
import Lottie from "lottie-react";

interface CommentProps {
    gameId: string;
    onSuccess: () => void;
}

export default function Comment({ gameId, onSuccess }: CommentProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [text, setText] = useState("");
    const [rating, setRating] = useState(0);

    const handleSubmit = async () => {
        if (!text.trim() || rating <= 0) return;

        try {
            const res = await fetch("/api/reviews/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gameId: Number(gameId),
                    content: text,
                    rating,
                }),
            });

            if (!res.ok) throw new Error("리뷰 등록 실패");
            setText("");
            setRating(0);
            onSuccess(); // 등록 성공 시 댓글 목록 새로고침
        } catch (err) {
            console.error(err);
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
                <Button label="등록" onClick={handleSubmit} />
            </div>
        </div>
    );
}
