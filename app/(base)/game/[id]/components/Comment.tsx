"use client";

import React, { useState } from "react";
import StarRating from "@/app/(base)/game/[id]/components/StarRating";
import Button from "@/app/components/Button";
import { cn } from "@/utils/tailwindUtil";

export default function Comment() {
    const [isFocused, setIsFocused] = useState(false);
    const [text, setText] = useState("");
    const [rating, setRating] = useState(0);

    return (
        <div className="w-[1000px] h-[250px] bg-background-100 rounded-[4px] p-4 flex gap-4 relative">
            {/* 왼쪽 텍스트 입력 영역 */}
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

            {/* 오른쪽 상단 별점 */}
            <div className="absolute top-4 right-4">
                <StarRating value={rating} onChange={setRating} />
            </div>

            {/* 오른쪽 하단 버튼 */}
            <div className="absolute bottom-4 right-4">
                <Button
                    label="등록"
                    onClick={() => console.log(text, rating)}
                />
            </div>
        </div>
    );
}
