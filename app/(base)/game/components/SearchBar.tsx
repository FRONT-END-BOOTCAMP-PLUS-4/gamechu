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
        <div className="flex items-center gap-1">
            <div
                className={cn(
                    "relative w-[250px] h-[32px] rounded-[4px] border transition overflow-hidden",
                    isFocused ? "border-primary-purple-200" : "border-line-200"
                )}
            >
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                    <Image
                        src="/icons/search.svg"
                        alt="검색"
                        width={16}
                        height={16}
                    />
                </div>

                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="제목 혹은 개발사를 입력하세요"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full h-full pl-8 pr-3 text-font-100 font-small placeholder-font-200 bg-background-100 outline-none rounded-[4px]"
                />
            </div>
        </div>
    );
}
