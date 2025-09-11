"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/utils/tailwindUtil";

interface SearchBarProps {
    keyword: string;
    setKeyword: (value: string) => void;
}

export default function SearchBar({ keyword, setKeyword }: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="gap-1s flex w-full items-center sm:max-w-[32ch]">
            <div
                className={cn(
                    "relative h-10 w-full overflow-hidden rounded-[4px] border transition",
                    isFocused ? "border-primary-purple-200" : "border-line-200"
                )}
            >
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                    <Image
                        src="/icons/search.svg"
                        alt="검색"
                        width={20}
                        height={20}
                    />
                </div>

                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="영문으로 제목 혹은 개발사를 입력하세요"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="font-small h-full w-full rounded-[4px] bg-background-100 pl-8 pr-3 text-font-100 placeholder-font-200 outline-none"
                />
            </div>
        </div>
    );
}
